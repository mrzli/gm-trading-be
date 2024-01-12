/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, it } from '@jest/globals';
import { splitFileDataByTimestamp } from './split-file-data';
import { BeforeAfterData } from '../../../types';

const DATA: readonly string[] = [
  '1696197780,2023-10-01T22:03:00.000Z,15410.90,15410.90,15402.50,15409.70',
  '1696197840,2023-10-01T22:04:00.000Z,15409.20,15413.30,15402.90,15405.60',
  '1696197900,2023-10-01T22:05:00.000Z,15407.40,15411.70,15396.70,15399.20',
  '1696197960,2023-10-01T22:06:00.000Z,15399.60,15412.10,15393.60,15408.10',
  '1696198020,2023-10-01T22:07:00.000Z,15408.60,15412.80,15407.20,15412.80',
  '1696198080,2023-10-01T22:08:00.000Z,15413.70,15419.20,15413.70,15417.90',
  '1696198140,2023-10-01T22:09:00.000Z,15417.10,15421.30,15416.50,15419.20',
  '1696198200,2023-10-01T22:10:00.000Z,15418.80,15420.90,15416.50,15419.90',
  '1696198260,2023-10-01T22:11:00.000Z,15418.10,15422.10,15417.20,15422.10',
  '1696198320,2023-10-01T22:12:00.000Z,15421.70,15422.10,15418.60,15418.60',
];

describe('split-file-data', () => {
  describe('splitFileDataByTimestamp()', () => {
    interface Example {
      readonly input: number;
      readonly expected: number;
    }

    const EXAMPLES: readonly Example[] = [
      {
        input: 0,
        expected: 0,
      },
      {
        input: 1696197780,
        expected: 0,
      },
      {
        input: 1696197800,
        expected: 1,
      },
      {
        input: 1696197840,
        expected: 1,
      },
      {
        input: 1696198100,
        expected: 6,
      },
      {
        input: 1696198320,
        expected: 9,
      },
      {
        input: 1696198340,
        expected: 10,
      },
    ];

    for (const example of EXAMPLES) {
      it(JSON.stringify(example), () => {
        const expected: BeforeAfterData = {
          before: DATA.slice(0, example.expected),
          after: DATA.slice(example.expected),
        };
        const actual = splitFileDataByTimestamp(DATA, example.input);
        expect(actual).toEqual(expected);
      });
    }
  });
});
