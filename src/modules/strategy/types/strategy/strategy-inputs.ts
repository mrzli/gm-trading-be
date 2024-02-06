import { Bar, Instrument, TradingParameters } from '@gmjs/gm-trading-shared';

export interface StrategyInputs {
  readonly instrument: Instrument;
  readonly params: TradingParameters;
  readonly data: readonly Bar[];
}
