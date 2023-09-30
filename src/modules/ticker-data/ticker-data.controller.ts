import { Controller, Get } from '@nestjs/common';
import { TickerDataService } from './ticker-data.service';
import { BodyZodValidated } from '../../middleware/decorators/parameter';
import {
  SCHEMA_TICKER_DATA_REQUEST_BODY,
  TickerDataRequestBody,
} from '@gmjs/gm-trading-shared';

@Controller('ticker-data')
export class TickerDataController {
  public constructor(private readonly tickerDataService: TickerDataService) {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }

  @Get('ticker-data')
  public async getTickerData(
    @BodyZodValidated(SCHEMA_TICKER_DATA_REQUEST_BODY)
    body: TickerDataRequestBody,
  ): Promise<readonly string[]> {
    return await this.tickerDataService.getTickerData(body);
  }
}
