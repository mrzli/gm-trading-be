import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import { TickerDataRequest } from '@gmjs/gm-trading-shared';
import { join } from '@gmjs/path';
import { sortArray, compareStringDesc } from '@gmjs/array-sort';

export async function getDataPaths(
  input: TickerDataRequest,
  dataDir: string,
): Promise<readonly string[]> {
  const { name, resolution } = input;

  const tickerDir = join(dataDir, name, resolution);

  return await lastValueFrom(
    fromFindFsEntries(tickerDir).pipe(
      filter((entry) => isTickerDataFile(entry)),
      mapRx((entry) => entry.path),
      toArrayRx(),
      mapRx((paths) => sortArray(paths, compareStringDesc())),
    ),
  );
}

function isTickerDataFile(entry: FilePathStats): boolean {
  const { path, stats } = entry;
  return stats.isFile() && path.endsWith('.csv');
}
