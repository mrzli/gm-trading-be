import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import { TickerDataRequest, TickerDataResolution } from '@gmjs/gm-trading-shared';
import { join } from '@gmjs/path';
import { sortArray, compareStringAsc } from '@gmjs/array-sort';

export async function getDataPaths(
  input: TickerDataRequest,
  dataDir: string,
): Promise<readonly string[]> {
  const { name, resolution } = input;

  const resolutionDir = toResolutionDir(resolution);
  const tickerDir = join(dataDir, name, resolutionDir);

  return await lastValueFrom(
    fromFindFsEntries(tickerDir).pipe(
      filter((entry) => isTickerDataFile(entry)),
      mapRx((entry) => entry.path),
      toArrayRx(),
      mapRx((paths) => sortArray(paths, compareStringAsc())),
    ),
  );
}

function isTickerDataFile(entry: FilePathStats): boolean {
  const { path, stats } = entry;
  return stats.isFile() && path.endsWith('.csv');
}

function toResolutionDir(
  resolution: TickerDataResolution,
): string {
  switch (resolution) {
    case '1m':
    case '2m':
    case '5m':
    case '10m': {
      return 'minute';
    }
    case '15m':
    case '30m':
    case '1h':
    case '2h':
    case '4h': {
      return 'quarter';
    }
    case 'D':
    case 'W':
    case 'M': {
      return 'day';
    }
  }
}
