import { DateTime } from 'luxon';
import {
  unixSecondsToUnixMilliseconds,
  DateObjectTz,
  dateObjectTzToUnixMilliseconds,
} from '@gmjs/date-util';
import { parseIntegerOrThrow } from '@gmjs/number-util';

export function unixMillisecondsToWeekday(
  unixMilliseconds: number,
  timezone: string,
): number {
  return DateTime.fromMillis(unixMilliseconds, { zone: timezone }).weekday;
}

export function unixSecondsToWeekday(
  unixSeconds: number,
  timezone: string,
): number {
  const unixMilliseconds = unixSecondsToUnixMilliseconds(unixSeconds);
  return unixMillisecondsToWeekday(unixMilliseconds, timezone);
}

export function dateObjectTzToWeekday(dateObject: DateObjectTz): number {
  const { timezone } = dateObject;
  const unixMilliseconds = dateObjectTzToUnixMilliseconds(dateObject);
  return unixMillisecondsToWeekday(unixMilliseconds, timezone);
}

export function getHourMinute(
  hourMinuteStr: string,
): readonly [number, number] {
  const [hourStr, minuteStr] = hourMinuteStr.split(':');
  const hour = parseIntegerOrThrow(hourStr);
  const minute = parseIntegerOrThrow(minuteStr);
  return [hour, minute];
}
