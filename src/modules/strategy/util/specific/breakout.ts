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
  StrategyTradeEvents,
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
import { clamp } from '@gmjs/number-util';

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
    tradeEvents: StrategyTradeEvents,
    context?: StrategyBreakoutContext,
  ): StrategyBarProcessingReturnValue<StrategyBreakoutContext> => {
    const breakoutStartOffset = -60;
    // const breakoutStartTimeRelativeTo = 'market-open';
    const breakoutTimeRange = 60;
    const breakoutPtsPadding = 0;

    const stopLossFraction = 0.1;
    const stopLossMinPts = 18;
    const stopLossMaxPts = 18;
    const limitFraction = 0.2;
    const limitMinPts = 100;
    const limitMaxPts = 100;

    const orderCanceOffset = 10;
    // const cancelTimeRelativeTo = 'market-open';

    const tradeCloseOffset = -5;
    // const closeTimeRelativeTo = 'market-close';

    // const cancelOtherDirection = true;

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

    // cancel other orders if any one is filled
    // it is possible that the order is filled and completed in the same bar
    //   so we can also check filled order events that occurred in the last bar
    if (activeTrades.length > 0 || tradeEvents.filledOrders.length > 0) {
      for (const activeOrder of activeOrders) {
        nextStepActions.push({
          kind: 'cancel-order',
          id: activeOrder.id,
          time: currentTime,
          targetId: activeOrder.id,
        });
      }
    }

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
          const topPrice = breakoutMax + padding;
          const bottomPrice = breakoutMin - padding;
          const stopLossDistance = clamp(
            (topPrice - bottomPrice) * stopLossFraction,
            stopLossMinPts,
            stopLossMaxPts,
          );

          const limitDistance = clamp(
            (topPrice - bottomPrice) * limitFraction,
            limitMinPts,
            limitMaxPts,
          );

          // const amount = Math.max(
          //   0.5,
          //   Math.ceil((400 / stopLossDistance) * 2) / 2,
          // );

          const amount = 10;

          nextStepActions.push(
            {
              kind: 'open',
              id: nextActionId++,
              time: currentTime,
              price: topPrice,
              amount: amount,
              stopLossDistance,
              limitDistance,
            },
            {
              kind: 'open',
              id: nextActionId++,
              time: currentTime,
              price: bottomPrice,
              amount: -amount,
              stopLossDistance,
              limitDistance,
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
