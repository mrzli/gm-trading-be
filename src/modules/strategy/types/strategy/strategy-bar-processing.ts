import {
  ManualTradeActionAny,
  TradesCollection,
} from '@gmjs/gm-trading-shared';
import { StrategyInputs } from './strategy-inputs';

export interface StrategyBarProcessingReturnValue<TContext = unknown> {
  readonly nextStepActions: readonly ManualTradeActionAny[];
  readonly context: TContext | undefined;
}

export type StrategyBarProcessingFn<TContext = unknown> = (
  inputs: StrategyInputs,
  index: number,
  tradesCollection: TradesCollection,
  context?: TContext,
) => StrategyBarProcessingReturnValue<TContext>;
