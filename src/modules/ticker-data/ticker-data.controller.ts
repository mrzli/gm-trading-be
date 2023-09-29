import { Controller, Get } from '@nestjs/common';
import { TickerDataService } from './ticker-data.service';
import { BodyZodValidated, QueryString } from '../../middleware/decorators/parameter';
import { z } from 'zod';

@Controller('ticker-data')
export class TickerDataController {
  public constructor(private readonly tickerDataService: TickerDataService) {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }

  @Get('ticker-data')
  public async getTickerData(
    @BodyZodValidated(z.any()) body: unknown,
  ): Promise<readonly string[]> {
    console.log(body);
    return await this.tickerDataService.getTickerData();
  }
}
