import { parseIntegerOrThrow } from '@gmjs/number-util';
import { BeforeAfterData } from '../types';

export function splitFileDataByTimestamp(
  data: readonly string[],
  ts: number,
): BeforeAfterData {
  const gteTsIndex = findFirstGteTsIndex(data, ts);

  return {
    before: data.slice(0, gteTsIndex),
    after: data.slice(gteTsIndex),
  };
}

function findFirstGteTsIndex(data: readonly string[], ts: number): number {
  let start = 0;
  let end = data.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const tsCurr = lineToTs(data, mid);

    if (ts === tsCurr) {
      return mid;
    } else if (ts > tsCurr) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return start;
}

function lineToTs(data: readonly string[], index: number): number {
  const [tsStr] = data[index]?.split(',') ?? '';
  return parseIntegerOrThrow(tsStr ?? '');
}
