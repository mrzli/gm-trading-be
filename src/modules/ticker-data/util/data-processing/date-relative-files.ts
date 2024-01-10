import { invariant } from '@gmjs/assert';
import { TickerDataResolution } from '@gmjs/gm-trading-shared';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import { pathFsName } from '@gmjs/path';
import { DateRelativeFiles, YearMonth } from '../../types';

export function getDateRelativeFiles(
  paths: readonly string[],
  resolution: TickerDataResolution,
  date: YearMonth | undefined,
): DateRelativeFiles {
  if (!date) {
    return {
      before: paths,
      current: undefined,
      after: [],
    };
  }

  switch (resolution) {
    case 'day': {
      return getDateRelativeFilesDay(paths, date);
    }
    case 'quarter': {
      return getDateRelativeFilesQuarter(paths, date);
    }
    case 'minute': {
      return getDateRelativeFilesMinute(paths, date);
    }
  }
}

function getDateRelativeFilesDay(
  paths: readonly string[],
  _date: YearMonth,
): DateRelativeFiles {
  return {
    before: [],
    current: paths[0],
    after: [],
  };
}

function getDateRelativeFilesQuarter(
  paths: readonly string[],
  date: YearMonth,
): DateRelativeFiles {
  const { year } = date;

  const pathsBefore = paths.filter((path) => {
    const pathYear = pathToYear(path);
    return pathYear < year;
  });

  const pathCurrent = paths.find((path) => {
    const pathYear = pathToYear(path);
    return pathYear === year;
  });

  const pathsAfter = paths.filter((path) => {
    const pathYear = pathToYear(path);
    return pathYear > year;
  });

  return {
    before: pathsBefore,
    current: pathCurrent,
    after: pathsAfter,
  };
}

function getDateRelativeFilesMinute(
  paths: readonly string[],
  date: YearMonth,
): DateRelativeFiles {
  const { year, month } = date;

  const pathsBefore = paths.filter((path) => {
    const { year: pathYear, month: pathMonth } = pathToYearMonth(path);
    return pathYear < year || (pathYear === year && pathMonth < month);
  });

  const pathCurrent = paths.find((path) => {
    const { year: pathYear, month: pathMonth } = pathToYearMonth(path);
    return pathYear === year && pathMonth === month;
  });

  const pathsAfter = paths.filter((path) => {
    const { year: pathYear, month: pathMonth } = pathToYearMonth(path);
    return pathYear > year || (pathYear === year && pathMonth > month);
  });

  return {
    before: pathsBefore,
    current: pathCurrent,
    after: pathsAfter,
  };
}

function pathToYearMonth(path: string): YearMonth {
  const baseFileName = pathFsName(path);
  const match = baseFileName.match(/^(\d{4})-(\d{2})$/);
  invariant(
    match !== null,
    `Invalid file name, expected 'yyyy-MM': '${path}'.`,
  );
  const year = parseIntegerOrThrow(match[1] ?? '');
  const month = parseIntegerOrThrow(match[2] ?? '');
  return {
    year,
    month,
  };
}

function pathToYear(path: string): number {
  const baseFileName = pathFsName(path);
  const match = baseFileName.match(/^(\d{4})$/);
  invariant(match !== null, `Invalid file name, expected 'yyyy': '${path}'.`);
  const year = parseIntegerOrThrow(match[1] ?? '');
  return year;
}

// based on date, find the file that contains the date
//   if the date is greater than the last date in the files, then read from last file to first for padding
//   if the date is lesser than the first date in the files, then read from first file to last for padding
//   if the date is within the range of the files
//      first
//          split the file into dates before and after
//          if the date is greater than the last line
//             file is split into all for previous and none for next
//          if the date is lesser than the first line
//             file is split into none for previous and all for next
//          if the date is within the range of the lines
//             file is split into some for previous and some for next
//             if date is exactly on a line, then that line belongs to next
//      next
//          read the previous data up to padding
//          read the next data up to padding
