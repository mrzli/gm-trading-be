import { readTextAsync } from '@gmjs/fs-async';
import { tickerDataContentToLines } from '../../../../util';

export async function readData(
  paths: readonly string[],
): Promise<readonly string[]> {
  const dataChunks: (readonly string[])[] = [];

  for (const path of paths) {
    const content = await readTextAsync(path);
    const lines = tickerDataContentToLines(content);
    dataChunks.push(lines);
  }

  return dataChunks.flat();
}
