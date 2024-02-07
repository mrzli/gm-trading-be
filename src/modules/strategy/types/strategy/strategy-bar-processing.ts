import {
  ActiveOrder,
  ActiveTrade,
  CompletedTrade,
  ManualTradeActionAny,
  TradesCollection,
} from '@gmjs/gm-trading-shared';
import { StrategyInputs } from './strategy-inputs';

export interface StrategyBarProcessingReturnValue<TContext = unknown> {
  readonly nextStepActions: readonly ManualTradeActionAny[];
  readonly context: TContext | undefined;
}

export interface StrategyTradeEvents {
  readonly createdOrders: readonly ActiveOrder[];
  readonly amendedOrders: readonly ActiveOrder[];
  readonly cancelledOrders: readonly ActiveOrder[];
  readonly filledOrders: readonly (readonly [ActiveOrder, ActiveTrade])[];
  readonly amendedTrades: readonly ActiveTrade[];
  readonly completedTrades: readonly CompletedTrade[];
}

export type StrategyBarProcessingFn<TContext = unknown> = (
  inputs: StrategyInputs,
  index: number,
  tradesCollection: TradesCollection,
  tradeEvents: StrategyTradeEvents,
  context?: TContext,
) => StrategyBarProcessingReturnValue<TContext>;
