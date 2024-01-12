import {
  Instrument,
  TickerDataRequest,
  TickerDataResponse,
} from '@gmjs/gm-trading-shared';
import { Injectable } from '@nestjs/common';
import { getTickerDataInfo, readData } from './util';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TickerDataTd365Service {
  private readonly dataDir: string;

  public constructor(
    configService: ConfigService,
    // private readonly tickerDataMetadataService: TickerDataMetadataService,
  ) {
    this.dataDir = configService.configOptions.td365DataDir;
  }

  public async getTickerData(
    input: TickerDataRequest,
    instrument: Instrument,
  ): Promise<TickerDataResponse> {
    // const { from, to } = input;
    // const { name: instrumentName } = instrument;

    // const metadata =
    //   await this.tickerDataMetadataService.getTd365Metadata(instrumentName);

    const info = await getTickerDataInfo(input, this.dataDir);
    const { paths, dataResolution } = info;

    const data = await readData(paths);

    return {
      instrument,
      dataResolution,
      data,
    };
  }
}
