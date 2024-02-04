import { JSONSchemaType } from 'ajv';
import { Instrument } from '@gmjs/gm-trading-shared';
import { AJV, readJson } from './shared';

type InstrumentsFileData = readonly Instrument[];

const TIME_REGEX = '^(?:(?:0[0-9])|(?:1[0-9])|(?:2[0-3])):[0-5][0-9]$';

const SCHEMA: JSONSchemaType<InstrumentsFileData> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: `^[A-Z0-9]+([A-Z0-9_]*)$`,
      },
      marketId: { type: 'integer', minimum: 0 },
      quoteId: { type: 'integer', minimum: 0 },
      precision: { type: 'integer', minimum: 0 },
      dataPrecision: { type: 'integer', minimum: 0 },
      pipDigit: { type: 'integer' },
      spread: { type: 'number', minimum: 0 },
      minStopLoss: { type: 'number', minimum: 0 },
      openTime: { type: 'string', pattern: TIME_REGEX },
      closeTime: { type: 'string', pattern: TIME_REGEX },
      timezone: { type: 'string', minLength: 1, maxLength: 128 },
    },
    required: [
      'name',
      'marketId',
      'quoteId',
      'precision',
      'dataPrecision',
      'spread',
      'minStopLoss',
      'openTime',
      'closeTime',
      'timezone',
    ],
    additionalProperties: false,
  },
};

const validate = AJV.compile<InstrumentsFileData>(SCHEMA);

export async function readInstruments(): Promise<readonly Instrument[]> {
  return await readJson(
    'instruments.json',
    validate,
    'Invalid instruments data.',
  );
}
