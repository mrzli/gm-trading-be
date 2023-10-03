import { readTextAsync } from '@gmjs/fs-async';

export async function readData(
  paths: readonly string[],
  totalEntries: number,
): Promise<readonly string[]> {
  let currNumEntries = 0;
  let data: string[] = [];

  for (const path of paths) {
    const content = await readTextAsync(path);
    const lines = tickerDataContentToLines(content);
    data = [...data, ...lines];
    currNumEntries += lines.length;
    if (currNumEntries >= totalEntries) {
      break;
    }
  }

  return data.slice(-totalEntries);
}

function tickerDataContentToLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}
