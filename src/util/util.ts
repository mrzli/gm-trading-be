import { parseIntegerOrThrow } from '@gmjs/number-util';

export function tickerDataContentToLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}

export function getTickerDataLineTimestamp(line: string): number {
  const [tsStr] = line.split(',');
  return parseIntegerOrThrow(tsStr);
}
