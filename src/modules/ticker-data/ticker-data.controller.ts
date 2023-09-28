import { Controller, Get } from '@nestjs/common';
import { TickerDataService } from './ticker-data.service';

@Controller('ticker-data')
export class TickerDataController {
  public constructor(private readonly tickerDataService: TickerDataService) {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }

  @Get('ticker-data')
  public async getTickerData(): Promise<readonly string[]> {
    return await this.tickerDataService.getTickerData();
  }
}
