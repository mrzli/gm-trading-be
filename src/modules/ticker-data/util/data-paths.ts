import { DateTime } from 'luxon';
import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import { TickerDataRequest } from '@gmjs/gm-trading-shared';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import { join, pathFsName } from '@gmjs/path';

export async function getDataPaths(
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
