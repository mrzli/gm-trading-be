import {
  ManualTradeActionAny,
  TradingParameters,
} from '@gmjs/gm-trading-shared';

export interface StrategyResult {
  readonly params: TradingParameters;
  readonly actions: readonly ManualTradeActionAny[];
}
