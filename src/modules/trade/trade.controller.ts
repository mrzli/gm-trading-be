import { TradeState } from '@gmjs/gm-trading-shared';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  public constructor(private readonly tradeService: TradeService) {}

  @Get('trade-states')
  public async getTradeStates(): Promise<readonly TradeState[]> {
    return await this.tradeService.getTradeStates('1');
  }

  @Post('save-trade-state')
  public async saveTradeState(@Body() tradeState: TradeState): Promise<void> {
    await this.tradeService.saveTradeState(tradeState);
  }
}
