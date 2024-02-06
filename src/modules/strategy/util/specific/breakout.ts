import {
  ManualTradeActionAny,
  TradesCollection,
  binarySearch,
  pipAdjust,
} from '@gmjs/gm-trading-shared';
import {
  StrategyBarProcessingFn,
  StrategyBarProcessingReturnValue,
  StrategyInputs,
  StrategySpecificInputBreakout,
} from '../../types';
import { invariant } from '@gmjs/assert';
import {
  DateObjectTz,
  dateObjectTzToUnixSeconds,
  unixSecondsAdd,
  unixSecondsToDateObjectTz,
} from '@gmjs/date-util';
import { getHourMinute, unixSecondsToWeekday } from '../../../../util';
import { applyFn } from '@gmjs/apply-function';
import { maxBy, minBy } from '@gmjs/value-transformers';

export interface StrategyBreakoutContext {
  readonly nextActionId: number;
  readonly nextTriggerCheckTime: number;
  readonly nextCloseCheckTime: number;
}

export function createStrategyBarProcessingBreakout(
  strategySpecificInput: StrategySpecificInputBreakout,
): StrategyBarProcessingFn<StrategyBreakoutContext> {
  return (
    inputs: StrategyInputs,
    index: number,
    tradesCollection: TradesCollection,
    context?: StrategyBreakoutContext,
  ): StrategyBarProcessingReturnValue<StrategyBreakoutContext> => {
    const breakoutStartOffset = 0;
    // const breakoutStartTimeRelativeTo = 'market-open';
    const breakoutTimeRange = 15;
    const breakoutPtsPadding = 2;

    // const fractionStopLoss = 0.5;
    // const maxStopLossPts = 10;

    const tradeCloseOffset = -5;
    // const closeTimeRelativeTo = 'market-close';

    // ---------------------------------------

    invariant(context !== undefined, 'Context must be defined');

    const { instrument, params, data } = inputs;
    const { pipDigit } = params;
    const { activeOrders, activeTrades } = tradesCollection;

    let { nextActionId, nextTriggerCheckTime, nextCloseCheckTime } = context;

    const {
      openTime: marketOpenHourMinute,
      closeTime: marketCloseHourMinute,
      timezone,
    } = instrument;

    const currentBar = data[index];
    const currentTime = currentBar.time;

    const nextStepActions: ManualTradeActionAny[] = [];

    if (currentTime >= nextTriggerCheckTime) {
      const marketOpenTimeUnixSeconds = unixSecondsAtTimeOfDay(
        currentTime,
        marketOpenHourMinute,
        timezone,
      );

      const breakoutStart =
        marketOpenTimeUnixSeconds + breakoutStartOffset * MINUTE_TO_SECONDS;
      const breakoutEnd = breakoutStart + breakoutTimeRange * MINUTE_TO_SECONDS;

      if (currentTime < breakoutEnd) {
        // we are before the breakout end
        nextTriggerCheckTime = breakoutEnd;
      } else {
        // we are after the breakout end
        if (
          currentTime >= breakoutEnd &&
          currentTime < breakoutEnd + TRIGGER_TIME_INTERVAL * MINUTE_TO_SECONDS
        ) {
          // we are in the breakout trigger interval

          const breakoutStartIndex = binarySearch(
            data,
            breakoutStart,
            (bar) => bar.time,
          );
          const breakoutEndIndex = binarySearch(
            data,
            breakoutEnd - 1,
            (bar) => bar.time,
          );

          const padding = pipAdjust(breakoutPtsPadding, pipDigit);
          const breakoutBars = data.slice(
            breakoutStartIndex,
            breakoutEndIndex + 1,
          );
          const breakoutMin = applyFn(
            breakoutBars,
            minBy((bar) => bar.low),
          );
          const breakoutMax = applyFn(
            breakoutBars,
            maxBy((bar) => bar.high),
          );
          const buyPrice = breakoutMax + padding;
          const sellPrice = breakoutMin - padding;
          const stopLossDistance = buyPrice - sellPrice;

          nextStepActions.push(
            // buy at the top, with stop-loss at the bottom
            {
              kind: 'open',
              id: nextActionId++,
              time: currentTime,
              price: buyPrice,
              amount: 1,
              stopLossDistance,
              limitDistance: undefined,
            },
            // sell at the bottom, with stop-loss at the top
            {
              kind: 'open',
              id: nextActionId++,
              time: currentTime,
              price: sellPrice,
              amount: -1,
              stopLossDistance,
              limitDistance: undefined,
            },
          );
        }

        // we need to advance nextTriggerCheckTime
        nextTriggerCheckTime = unixSecondsGoToNextWorkingDay(
          breakoutEnd,
          timezone,
        );
      }
    }

    if (currentTime >= nextCloseCheckTime) {
      const marketCloseSeconds = unixSecondsAtTimeOfDay(
        currentTime,
        marketCloseHourMinute,
        timezone,
      );

      const tradeCloseTime =
        marketCloseSeconds + tradeCloseOffset * MINUTE_TO_SECONDS;
      if (currentTime >= tradeCloseTime) {
        // we are after the trade close time

        // cancel all active orders
        for (const activeOrder of activeOrders) {
          nextStepActions.push({
            kind: 'cancel-order',
            id: activeOrder.id,
            time: currentTime,
            targetId: activeOrder.id,
          });
        }

        // close all active trades
        for (const activeTrade of activeTrades) {
          nextStepActions.push({
            kind: 'close-trade',
            id: activeTrade.id,
            time: currentTime,
            targetId: activeTrade.id,
          });
        }

        // we need to advance nextCloseCheckTime
        nextCloseCheckTime = unixSecondsGoToNextWorkingDay(
          tradeCloseTime,
          timezone,
        );
      }
    }

    return {
      nextStepActions,
      context: {
        nextActionId,
        nextTriggerCheckTime,
        nextCloseCheckTime,
      },
    };
  };
}

const TRIGGER_TIME_INTERVAL = 5;
const MINUTE_TO_SECONDS = 60;

function unixSecondsAtTimeOfDay(
  currentTime: number,
  hourMinute: string,
  timezone: string,
): number {
  const [hour, minute] = getHourMinute(hourMinute);

  const dateObject: DateObjectTz = {
    ...unixSecondsToDateObjectTz(currentTime, timezone),
    hour,
    minute,
    second: 0,
    millisecond: 0,
  };

  return dateObjectTzToUnixSeconds(dateObject);
}

function unixSecondsGoToNextWorkingDay(
  currentTime: number,
  timezone: string,
): number {
  const weekday = unixSecondsToWeekday(currentTime, timezone);
  const dayIncrement = weekday >= 5 ? 8 - weekday : 1;
  return unixSecondsAdd(currentTime, timezone, { days: dayIncrement });
}
