import { JSONSchemaType } from 'ajv';
import { DatesData } from '../../../types';
import { AJV, readJson } from './shared';

const SCHEMA: JSONSchemaType<DatesData> = {
  type: 'object',
  properties: {
    nyseMarketHolidays: {
      type: 'array',
      items: { type: 'string', format: 'date' },
    },
    fomcDates: {
      type: 'array',
      items: { type: 'string', format: 'date' },
    },
    usCpiDates: {
      type: 'array',
      items: { type: 'string', format: 'date' },
    },
  },
  required: ['nyseMarketHolidays', 'fomcDates', 'usCpiDates'],
  additionalProperties: false,
};

const validate = AJV.compile<DatesData>(SCHEMA);

export async function readDates(): Promise<DatesData> {
  return await readJson('dates.json', validate, 'Invalid dates data.');
}
