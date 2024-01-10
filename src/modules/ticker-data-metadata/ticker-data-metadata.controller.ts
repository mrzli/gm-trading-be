import { Controller, Get } from '@nestjs/common';

@Controller('ticker-data-metadata')
export class TickerDataMetadataController {
  public constructor() {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }
}
