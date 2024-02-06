import { Body, Controller, Get, Post } from '@nestjs/common';
import { RunStrategyRequest } from '@gmjs/gm-trading-shared';
import { StrategyService } from './strategy.service';

@Controller('strategy')
export class StrategyController {
  public constructor(
    private readonly strategyService: StrategyService,
  ) {}

  @Get('example')
  public async example(): Promise<string> {
    return 'some value';
  }

  @Post('run-strategy')
  public async runStrategy(
    @Body() request: RunStrategyRequest,
  ): Promise<void> {
    await this.strategyService.runStrategy(request);
  }
}
