import { TickerDataTd365Service } from './ticker-data-td365.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  TickerDataRequest,
  TickerDataResponse,
} from '@gmjs/gm-trading-shared';
import { DataService } from '../data/data.service';

@Injectable()
export class TickerDataService {
  public constructor(
    private readonly dataService: DataService,
    private readonly tickerDataTd365Service: TickerDataTd365Service,
  ) {}

  public async getTickerData(
    input: TickerDataRequest,
  ): Promise<TickerDataResponse> {
    const { source, name, resolution } = input;

    if (!this.dataService.hasInstrument(name)) {
      throw new BadRequestException(`Instrument with name not found: '${name}'.`);
    }

    const instrument = await this.dataService.getInstrumentByName(name);

    switch (source) {
      case 'td365': {
        return await this.tickerDataTd365Service.getTickerData(
          input,
          instrument,
          resolution,
        );
      }
      default: {
        throw new BadRequestException(
          `Data source not supported: '${source}'.`,
        );
      }
    }
  }
}
