import {
  compareStringAsc,
  compareStringDesc,
  sortArray,
} from '@gmjs/array-sort';
import { readTextAsync } from '@gmjs/fs-async';
import { TickerDataRequest } from '@gmjs/gm-trading-shared';
import {
  getDateRelativeFiles,
  splitFileDataByTimestamp,
} from './data-processing';
import { BeforeAfterData } from '../../types';
import { dateToUnixSeconds, dateToYearMonth } from './date';
import { tickerDataContentToLines } from '../../../../util';

export interface ReadTickerDataResult {
  readonly data: readonly string[];
  readonly limitStart: boolean;
  readonly limitEnd: boolean;
}

export async function readData(
  input: TickerDataRequest,
  paths: readonly string[],
  entriesPadding: number,
): Promise<ReadTickerDataResult> {
  const { before, after } = await getBeforeAfterData(
    input,
    paths,
    entriesPadding,
  );

  const limitStart = before.length < entriesPadding;
  const limitEnd = after.length < entriesPadding;

  return {
    data: [...before, ...after],
    limitStart,
    limitEnd,
  };
}

async function getBeforeAfterData(
  input: TickerDataRequest,
  paths: readonly string[],
  entriesPadding: number,
): Promise<BeforeAfterData> {
  const { resolution } = input;

  const date = undefined;

  const yearMonth = date ? dateToYearMonth(date) : undefined;

  const dateRelativeFiles = getDateRelativeFiles(paths, resolution, yearMonth);
  const {
    before: beforeFiles,
    current: currentFile,
    after: afterFiles,
  } = dateRelativeFiles;

  const { before: initialBeforeData, after: initialAfterData } =
    await getFileBeforeAfterDataForSingleFiles(currentFile, date);

  const beforeData = await getBeforeData(
    initialBeforeData,
    beforeFiles,
    entriesPadding,
  );

  const afterData = await getAfterData(
    initialAfterData,
    afterFiles,
    entriesPadding,
  );

  return {
    before: beforeData,
    after: afterData,
  };
}

async function getFileBeforeAfterDataForSingleFiles(
  currentFile: string | undefined,
  date: string | undefined,
): Promise<BeforeAfterData> {
  if (!currentFile) {
    return {
      before: [],
      after: [],
    };
  }

  const content = await readTextAsync(currentFile);
  const lines = tickerDataContentToLines(content);

  if (!date) {
    return {
      before: lines,
      after: [],
    };
  }

  const ts = dateToUnixSeconds(date);
  return splitFileDataByTimestamp(lines, ts);
}

async function getBeforeData(
  initialBeforeData: readonly string[],
  beforeFiles: readonly string[],
  entriesPadding: number,
): Promise<readonly string[]> {
  let beforeData: readonly string[] = initialBeforeData;

  const pathsLatestToFirst = sortArray(beforeFiles, compareStringDesc());

  for (const path of pathsLatestToFirst) {
    const content = await readTextAsync(path);
    const lines = tickerDataContentToLines(content);
    beforeData = [...lines, ...beforeData]; // prepend, since data is read latest to first
    if (beforeData.length >= entriesPadding) {
      break;
    }
  }

  return beforeData.slice(-entriesPadding);
}

async function getAfterData(
  initialAfterData: readonly string[],
  afterFiles: readonly string[],
  entriesPadding: number,
): Promise<readonly string[]> {
  let afterData: readonly string[] = initialAfterData;

  const pathsFirstToLatest = sortArray(afterFiles, compareStringAsc());

  for (const path of pathsFirstToLatest) {
    const content = await readTextAsync(path);
    const lines = tickerDataContentToLines(content);
    afterData = [...afterData, ...lines]; // append, since data is read first to latest
    if (afterData.length >= entriesPadding) {
      break;
    }
  }

  return afterData.slice(0, entriesPadding);
}
