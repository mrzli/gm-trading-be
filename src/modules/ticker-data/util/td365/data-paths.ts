import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import {
  TickerDataRequest,
  TickerDataResolution,
} from '@gmjs/gm-trading-shared';
import { join } from '@gmjs/path';
import { sortArray, compareStringAsc } from '@gmjs/array-sort';
import { ensureNever, invariant } from '@gmjs/assert';

export interface TickerDataInfo {
  readonly paths: readonly string[];
  readonly dataResolution: TickerDataResolution;
}

export async function getTickerDataInfo(
  input: TickerDataRequest,
  dataDir: string,
): Promise<TickerDataInfo> {
  const { name, resolution } = input;

  const dataResolution = toDataResolution(resolution);
  const resolutionDir = toResolutionDir(dataResolution);
  const tickerDir = join(dataDir, name, resolutionDir);

  const paths = await lastValueFrom(
    fromFindFsEntries(tickerDir).pipe(
      filter((entry) => isTickerDataFile(entry)),
      mapRx((entry) => entry.path),
      toArrayRx(),
      mapRx((paths) => sortArray(paths, compareStringAsc())),
    ),
  );

  return {
    paths,
    dataResolution,
  };
}

function isTickerDataFile(entry: FilePathStats): boolean {
  const { path, stats } = entry;
  return stats.isFile() && path.endsWith('.csv');
}

function toDataResolution(
  resolution: TickerDataResolution,
): TickerDataResolution {
  switch (resolution) {
    case '1m':
    case '2m':
    case '5m':
    case '10m': {
      return '1m';
    }
    case '15m':
    case '30m':
    case '1h':
    case '2h':
    case '4h': {
      return '15m';
    }
    case 'D':
    case 'W':
    case 'M': {
      return 'D';
    }
    default: {
      return ensureNever(resolution);
    }
  }
}

function toResolutionDir(resolution: TickerDataResolution): string {
  switch (resolution) {
    case '1m': {
      return 'minute';
    }
    case '15m': {
      return 'quarter';
    }
    case 'D': {
      return 'day';
    }
    default: {
      invariant(false, `Invalid data resolution: '${resolution}'.`);
    }
  }
}
