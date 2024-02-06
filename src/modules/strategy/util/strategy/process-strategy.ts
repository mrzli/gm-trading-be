import {
  ManualTradeActionAny,
  TradesCollection,
  processBarForTrade,
} from '@gmjs/gm-trading-shared';
import {
  StrategyBarProcessingFn,
  StrategyBarProcessingReturnValue,
  StrategyInputs,
  StrategyResult,
} from '../../types';

export function processStrategy<TContext = unknown>(
  inputs: StrategyInputs,
  strategy: StrategyBarProcessingFn<TContext>,
  initialContext?: TContext,
): StrategyResult {
  const { data, params } = inputs;

  const manualTradeActions: ManualTradeActionAny[] = [];

  let currentStrategyStepResult: StrategyBarProcessingReturnValue<TContext> = {
    nextStepActions: [],
    context: initialContext,
  };

  let currentTradesCollection: TradesCollection = {
    activeOrders: [],
    activeTrades: [],
    completedTrades: [],
  };

  for (let i = 1; i < data.length; i++) {
    currentStrategyStepResult = strategy(
      inputs,
      i,
      currentTradesCollection,
      currentStrategyStepResult.context,
    );

    currentTradesCollection = processBarForTrade(
      params,
      currentTradesCollection,
      data,
      i,
      data.length - 1,
      () => currentStrategyStepResult.nextStepActions,
      undefined,
    );

    manualTradeActions.push(...currentStrategyStepResult.nextStepActions);
  }

  return {
    params,
    actions: manualTradeActions,
  };
}
