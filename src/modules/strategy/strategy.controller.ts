import { Controller, Get } from '@nestjs/common';

@Controller('strategy')
export class StrategyController {
  public constructor() {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }
}
