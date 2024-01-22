import { NonRequiredOnly } from './../../types/generic/generic';
import { Injectable } from '@nestjs/common';
import {
  TickerDataResolution,
  TickerDataSource,
  TradeState,
} from '@gmjs/gm-trading-shared';
import { TradeStateRepository } from '../db/repositories';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import { DbTradeState } from '../db/types';

@Injectable()
export class TradeService {
  public constructor(
    private readonly tradeStateRepository: TradeStateRepository,
  ) {}

  public async getTradeStates(userId: string): Promise<readonly TradeState[]> {
    const dbUserId = parseIntegerOrThrow(userId);
    const result = await this.tradeStateRepository.findAllForUser(dbUserId);
    return result.map((item) => dbTradeStateToTradeState(item));
  }

  public async saveTradeState(tradeState: TradeState): Promise<void> {
    const dbTradeState = tradeStateToDbTradeState(tradeState);
    await this.tradeStateRepository.upsert(dbTradeState);
  }
}

function dbTradeStateToTradeState(dbTradeState: DbTradeState): TradeState {
  return {
    userId: dbTradeState.user_id.toString(),
    saveName: dbTradeState.save_name,
    tickerDataSource: dbTradeState.ticker_data_source as TickerDataSource,
    tickerName: dbTradeState.ticker_name,
    tickerResolution: dbTradeState.ticker_resolution as TickerDataResolution,
    timezone: dbTradeState.timezone,
    barIndex: dbTradeState.bar_index,
    tradingParameters: JSON.parse(dbTradeState.trading_parameters),
    manualTradeActions: JSON.parse(dbTradeState.manual_trade_actions),
  };
}

function tradeStateToDbTradeState(
  tradeState: TradeState,
): NonRequiredOnly<DbTradeState, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: parseIntegerOrThrow(tradeState.userId),
    save_name: tradeState.saveName,
    ticker_data_source: tradeState.tickerDataSource,
    ticker_name: tradeState.tickerName,
    ticker_resolution: tradeState.tickerResolution,
    timezone: tradeState.timezone,
    bar_index: tradeState.barIndex,
    trading_parameters: JSON.stringify(tradeState.tradingParameters),
    manual_trade_actions: JSON.stringify(tradeState.manualTradeActions),
  };
}
