import { Bar } from '@gmjs/gm-trading-shared';
import { parseIntegerOrThrow, parseFloatOrThrow } from '@gmjs/number-util';

export function toBars(lines: readonly string[]): readonly Bar[] {
  return lines.map((element) => toBar(element));
}

function toBar(line: string): Bar {
  const [timestamp, _date, open, high, low, close] = line.split(',');

  return {
    time: parseIntegerOrThrow(timestamp),
    open: parseFloatOrThrow(open),
    high: parseFloatOrThrow(high),
    low: parseFloatOrThrow(low),
    close: parseFloatOrThrow(close),
  };
}
