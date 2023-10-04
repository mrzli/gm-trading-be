import { DateTime } from 'luxon';
import { YearMonth } from './types';

export function dateToYearMonth(date: string): YearMonth {
  const dateTime = DateTime.fromISO(date, { zone: 'UTC' });
  return {
    year: dateTime.year,
    month: dateTime.month,
  };
}

export function dateToUnixSeconds(date: string): number {
  const dateTime = DateTime.fromISO(date, { zone: 'UTC' });
  return dateTime.toSeconds();
}
