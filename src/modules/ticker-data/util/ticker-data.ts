import { DateTime } from 'luxon';
import { parseIntegerOrThrow } from '@gmjs/number-util';

export function tickerDataContentToLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}

export function cropDataToDateRange(
  data: readonly string[],
  dateFrom: DateTime,
  dateTo: DateTime,
): readonly string[] {
  const tsFrom = dateFrom.toSeconds();
  const tsTo = dateTo.toSeconds();

  const firstTs = parseIntegerOrThrow(data[0]?.split(',')[0] ?? '');
  const lastTs = parseIntegerOrThrow(data.at(-1)?.split(',')[0] ?? '');

  if (tsTo < tsFrom || tsFrom > lastTs || tsTo < firstTs) {
    return [];
  }

  let firstIndex = data.length;

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < data.length; i++) {
    const line = data[i] ?? '';
    const [tsStr] = line.split(',');
    const ts = parseIntegerOrThrow(tsStr ?? '');
    if (ts >= tsFrom) {
      firstIndex = i;
      break;
    }
  }

  let lastIndex = -1;

  for (let i = firstIndex; i < data.length; i++) {
    const line = data[i] ?? '';
    const [tsStr] = line.split(',');
    const ts = parseIntegerOrThrow(tsStr ?? '');
    if (ts > tsTo) {
      lastIndex = i;
      break;
    }
  }

  lastIndex = lastIndex === -1 ? data.length : lastIndex;

  return data.slice(firstIndex, lastIndex);
}
