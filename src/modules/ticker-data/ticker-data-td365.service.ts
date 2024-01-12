import {
  Instrument,
  TickerDataRequest,
  TickerDataResolution,
  TickerDataResponse,
} from '@gmjs/gm-trading-shared';
import { Injectable } from '@nestjs/common';
import { getDataPaths, readData } from './util';
import { TickerDataMetadataService } from '../ticker-data-metadata/ticker-data-metadata.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TickerDataTd365Service {
  private readonly dataDir: string;

  public constructor(
    configService: ConfigService,
    private readonly tickerDataMetadataService: TickerDataMetadataService,
  ) {
    this.dataDir = configService.configOptions.td365DataDir;
  }

  public async getTickerData(
    input: TickerDataRequest,
    instrument: Instrument,
    resolution: TickerDataResolution,
  ): Promise<TickerDataResponse> {
    // const { from, to } = input;
    const { name: instrumentName } = instrument;

    const metadata =
      await this.tickerDataMetadataService.getTd365Metadata(instrumentName);

    const paths = await getDataPaths(input, this.dataDir);

    const data = await readData(
      input,
      paths,
      DATA_ENTRIES_PADDING,
    );

    return {
      instrument,
      resolution,
      startChunkIndex: 0,
      data,
    };
  }
}

const DATA_ENTRIES_PADDING = 1_000_000;
