import {
  ActiveOrder,
  ActiveTrade,
  CompletedTrade,
  ManualTradeActionAny,
  ProcessBarEventHandlers,
  TradesCollection,
  processBarForTrade,
} from '@gmjs/gm-trading-shared';
import {
  StrategyBarProcessingFn,
  StrategyBarProcessingReturnValue,
  StrategyInputs,
  StrategyResult,
  StrategyTradeEvents,
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

  let strategyTradeEvents: StrategyTradeEvents = {
    createdOrders: [],
    amendedOrders: [],
    cancelledOrders: [],
    filledOrders: [],
    amendedTrades: [],
    completedTrades: [],
  };

  for (let i = 1; i < data.length; i++) {
    const [getStrategyTradeEvents, eventHandlers] = createProcessBarEventHandlers();

    currentStrategyStepResult = strategy(
      inputs,
      i,
      currentTradesCollection,
      strategyTradeEvents,
      currentStrategyStepResult.context,
    );

    currentTradesCollection = processBarForTrade(
      params,
      currentTradesCollection,
      data,
      i,
      data.length - 1,
      () => currentStrategyStepResult.nextStepActions,
      eventHandlers,
    );

    strategyTradeEvents = getStrategyTradeEvents();

    manualTradeActions.push(...currentStrategyStepResult.nextStepActions);
  }

  return {
    params,
    actions: manualTradeActions,
  };
}

function createProcessBarEventHandlers(): readonly [
  () => StrategyTradeEvents,
  ProcessBarEventHandlers,
] {
  const createdOrders: ActiveOrder[] = [];
  const amendedOrders: ActiveOrder[] = [];
  const cancelledOrders: ActiveOrder[] = [];
  const filledOrders: [ActiveOrder, ActiveTrade][] = [];
  const amendedTrades: ActiveTrade[] = [];
  const completedTrades: CompletedTrade[] = [];

  const getStrategyTradeEvents = (): StrategyTradeEvents => {
    return {
      createdOrders,
      amendedOrders,
      cancelledOrders,
      filledOrders,
      amendedTrades,
      completedTrades,
    };
  };

  const eventHandlers: ProcessBarEventHandlers = {
    handleCreateOrder: (order: ActiveOrder): void => {
      createdOrders.push(order);
    },
    handleAmendOrder: (order: ActiveOrder): void => {
      amendedOrders.push(order);
    },
    handleCancelOrder: (order: ActiveOrder): void => {
      cancelledOrders.push(order);
    },
    handleFillOrder: (order: ActiveOrder, trade: ActiveTrade): void => {
      filledOrders.push([order, trade]);
    },
    handleAmendTrade: (trade: ActiveTrade): void => {
      amendedTrades.push(trade);
    },
    handleCompleteTrade: (trade: CompletedTrade): void => {
      completedTrades.push(trade);
    },
  };

  return [getStrategyTradeEvents, eventHandlers];
}
