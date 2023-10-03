import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { readTextAsync } from '@gmjs/fs-async';
import { TickerDataRequest, TickerDataResponse } from '@gmjs/gm-trading-shared';
import { ConfigService } from '../config/config.service';
import { DataService } from '../data/data.service';
import { applyFn } from '@gmjs/apply-function';
import { compose } from '@gmjs/compose-function';
import { flatMap, toArray } from '@gmjs/value-transformers';
import { cropDataToDateRange, getDataPaths, tickerDataContentToLines } from './util';

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
