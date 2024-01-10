import { Instrument, TickerDataRequest, TickerDataResolution, TickerDataResponse } from '@gmjs/gm-trading-shared';
import { Injectable } from '@nestjs/common';
import { getDataPaths, readData } from './util';
import { TickerDataMetadataService } from '../ticker-data-metadata/ticker-data-metadata.service';

@Injectable()
export class TickerDataTd365Service {
  public constructor(
    private readonly tickerDataMetadataService: TickerDataMetadataService,
  ) {}

  public async getTickerData(
    input: TickerDataRequest,
    instrument: Instrument,
    resolution: TickerDataResolution
  ): Promise<TickerDataResponse> {
    const { date } = input;

    const metadata =
      await this.tickerDataMetadataService.getTd365DataMetadata();
    const { dataDir } = metadata;

    const paths = await getDataPaths(input, dataDir);

    const { data, limitStart, limitEnd } = await readData(
      input,
      paths,
      DATA_ENTRIES_PADDING,
    );

    return {
      instrument,
      resolution,
      date,
      data,
      limitStart,
      limitEnd,
    };
  }
}

const DATA_ENTRIES_PADDING = 1_000_000;
