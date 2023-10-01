import { Controller, Get, Post } from '@nestjs/common';
import { TickerDataService } from './ticker-data.service';
import { BodyZodValidated } from '../../middleware/decorators/parameter';
import {
  SCHEMA_TICKER_DATA_REQUEST_BODY,
  TickerDataRequest,
  TickerDataResponse,
} from '@gmjs/gm-trading-shared';

@Controller('ticker-data')
export class TickerDataController {
  public constructor(private readonly tickerDataService: TickerDataService) {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }

  @Post('ticker-data')
  public async getTickerData(
    @BodyZodValidated(SCHEMA_TICKER_DATA_REQUEST_BODY)
    body: TickerDataRequest,
  ): Promise<TickerDataResponse> {
    return await this.tickerDataService.getTickerData(body);
  }
}
