import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { join, pathFsName } from '@gmjs/path';
import { readTextAsync } from '@gmjs/fs-async';
import { TickerDataRequest, TickerDataResponse } from '@gmjs/gm-trading-shared';
import { ConfigService } from '../config/config.service';
import { DataService } from '../data/data.service';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import { applyFn } from '@gmjs/apply-function';
import { compose } from '@gmjs/compose-function';
import { flatMap, toArray } from '@gmjs/value-transformers';

@Injectable()
export class TickerDataService {
  private readonly dataDir: string;

  public constructor(
    configService: ConfigService,
    private readonly dataService: DataService,
  ) {
    const { dataDir } = configService.configOptions;
    this.dataDir = dataDir;
  }

  public async getTickerData(
    input: TickerDataRequest,
  ): Promise<TickerDataResponse> {
    const { name, resolution, from, to } = input;

    const instruments = await this.dataService.getAllInstruments();
    const instrumentNames = new Set(
      instruments.map((instrument) => instrument.name),
    );
    if (!instrumentNames.has(name)) {
      throw new BadRequestException(`Instrument with name ${name} not found.`);
    }

    const instrument = await this.dataService.getInstrumentByName(name);

    const dateFrom = DateTime.fromISO(from, { zone: 'UTC' });
    const dateTo = DateTime.fromISO(to, { zone: 'UTC' });

    const paths = await getDataPaths(input, this.dataDir);

    const contents = await Promise.all(
      paths.map((path) => readTextAsync(path)),
    );
    
    const data = applyFn(
      contents,
      compose(
        flatMap((content: string) => tickerDataContentToLines(content)),
        toArray(),
      ),
    );

    const finalData = cropDataToDateRange(data, dateFrom, dateTo);
    if (finalData.length > 1000) {
      throw new BadRequestException(
        `Too much data requested. Please request a smaller date range.`,
      );
    }

    return {
      instrument,
      resolution,
      from,
      to,
      data: finalData,
    };
  }
}

async function getDataPaths(
  input: TickerDataRequest,
  dataDir: string,
): Promise<readonly string[]> {
  const { name, resolution, from, to } = input;

  const tickerDir = join(dataDir, name, resolution);

  switch (resolution) {
    case 'day': {
      return await getDataPathsDay(tickerDir, from, to);
    }
    case 'quarter': {
      return await getDataPathsQuarter(tickerDir, from, to);
    }
    case 'minute': {
      return await getDataPathsMinute(tickerDir, from, to);
    }
  }
}

async function getDataPathsDay(
  tickerDir: string,
  _from: string,
  _to: string,
): Promise<readonly string[]> {
  return [join(tickerDir, 'all.csv')];
}

async function getDataPathsQuarter(
  tickerDir: string,
  from: string,
  to: string,
): Promise<readonly string[]> {
  const dateFrom = DateTime.fromISO(from, { zone: 'UTC' });
  const dateTo = DateTime.fromISO(to, { zone: 'UTC' });

  const { year: yearFrom } = dateFrom;
  const { year: yearTo } = dateTo;

  return await lastValueFrom(
    fromFindFsEntries(tickerDir).pipe(
      filter((entry) => filterEntryQuarter(entry, yearFrom, yearTo)),
      mapRx((entry) => entry.path),
      toArrayRx(),
    ),
  );
}

function filterEntryQuarter(
  entry: FilePathStats,
  yearFrom: number,
  yearTo: number,
): boolean {
  const { path, stats } = entry;
  if (!stats.isFile()) {
    return false;
  }

  if (!path.endsWith('.csv')) {
    return false;
  }

  const baseFileName = pathFsName(path);
  const match = baseFileName.match(/^(\d{4})$/);
  if (!match) {
    return false;
  }

  const year = parseIntegerOrThrow(match[1] ?? '');

  return year >= yearFrom && year <= yearTo;
}

async function getDataPathsMinute(
  tickerDir: string,
  from: string,
  to: string,
): Promise<readonly string[]> {
  const dateFrom = DateTime.fromISO(from, { zone: 'UTC' });
  const dateTo = DateTime.fromISO(to, { zone: 'UTC' });

  const { year: yearFrom, month: monthFrom } = dateFrom;
  const { year: yearTo, month: monthTo } = dateTo;

  return await lastValueFrom(
    fromFindFsEntries(tickerDir).pipe(
      filter((entry) =>
        filterEntryMinute(entry, yearFrom, yearTo, monthFrom, monthTo),
      ),
      mapRx((entry) => entry.path),
      toArrayRx(),
    ),
  );
}

function filterEntryMinute(
  entry: FilePathStats,
  yearFrom: number,
  yearTo: number,
  monthFrom: number,
  monthTo: number,
): boolean {
  const { path, stats } = entry;
  if (!stats.isFile()) {
    return false;
  }

  if (!path.endsWith('.csv')) {
    return false;
  }

  const baseFileName = pathFsName(path);
  const match = baseFileName.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const year = parseIntegerOrThrow(match[1] ?? '');
  const month = parseIntegerOrThrow(match[2] ?? '');

  if (year < yearFrom || year > yearTo) {
    return false;
  }

  if (year === yearFrom && month < monthFrom) {
    return false;
  }

  if (year === yearTo && month > monthTo) {
    return false;
  }

  return true;
}

function tickerDataContentToLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}

function cropDataToDateRange(data: readonly string[], dateFrom: DateTime, dateTo: DateTime): readonly string[] {
  const tsFrom = dateFrom.toSeconds();
  const tsTo = dateTo.toSeconds();

  const firstTs = parseIntegerOrThrow(data[0]?.split(',')[0] ?? '');
  const lastTs = parseIntegerOrThrow(data.at(-1)?.split(',')[0] ?? '');

  if (tsTo < tsFrom || tsFrom > lastTs || tsTo < firstTs) {
    return [];
  }

  let firstIndex = data.length;

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < data.length; i++) {
    const line = data[i] ?? '';
    const [tsStr] = line.split(',');
    const ts = parseIntegerOrThrow(tsStr ?? '');
    if (ts >= tsFrom) {
      firstIndex = i;
      break;
    }
  }

  let lastIndex = -1;

  for (let i = firstIndex; i < data.length; i++) {
    const line = data[i] ?? '';
    const [tsStr] = line.split(',');
    const ts = parseIntegerOrThrow(tsStr ?? '');
    if (ts > tsTo) {
      lastIndex = i;
      break;
    }
  }

  lastIndex = lastIndex === -1 ? data.length : lastIndex;

  return data.slice(firstIndex, lastIndex);
}
