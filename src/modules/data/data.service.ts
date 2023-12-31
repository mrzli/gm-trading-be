import { join } from 'node:path';
import Ajv, { JSONSchemaType } from 'ajv';
import { Injectable } from '@nestjs/common';
import { readTextAsync } from '@gmjs/fs-async';
import { invariant } from '@gmjs/assert';
import { mapGetOrThrow } from '@gmjs/data-container-util';
import { applyFn } from '@gmjs/apply-function';
import { toMapBy } from '@gmjs/value-transformers';
import { Instrument } from '@gmjs/gm-trading-shared';

@Injectable()
export class DataService {
  private _instruments: readonly Instrument[] | undefined;
  private _instrumentMap: ReadonlyMap<string, Instrument> | undefined;

  public constructor() {}

  public async getAllInstruments(): Promise<readonly Instrument[]> {
    await this.intializeInstruments();
    return this.instruments;
  }

  public async getInstrumentByName(name: string): Promise<Instrument> {
    await this.intializeInstruments();
    const instrument = mapGetOrThrow(this.instrumentMap, name);
    return instrument;
  }

  private async intializeInstruments(): Promise<void> {
    if (!this._instruments) {
      const instruments = await readInstruments();
      this._instruments = instruments;
      this._instrumentMap = applyFn(
        instruments,
        toMapBy((item) => item.name),
      );
    }
  }

  private get instruments(): readonly Instrument[] {
    const instruments = this._instruments;
    invariant(instruments !== undefined, 'Instruments not initialized.');
    return instruments;
  }

  private get instrumentMap(): ReadonlyMap<string, Instrument> {
    const instrumentMap = this._instrumentMap;
    invariant(instrumentMap !== undefined, 'Instruments not initialized.');
    return instrumentMap;
  }
}

const SERVER_DATA_DIR = 'data';

const AJV = new Ajv();

type InstrumentsFileData = readonly Instrument[];

const TIME_REGEX = '^(?:(?:0[0-9])|(?:1[0-9])|(?:2[0-3])):[0-5][0-9]$';

const INSTRUMENTS_SCHEMA: JSONSchemaType<InstrumentsFileData> = {
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

const validateInstruments =
  AJV.compile<InstrumentsFileData>(INSTRUMENTS_SCHEMA);

async function readInstruments(): Promise<readonly Instrument[]> {
  const path = join(SERVER_DATA_DIR, 'instruments.json');
  const content = await readTextAsync(path);
  const data = JSON.parse(content);
  const isValid = validateInstruments(data);
  if (!isValid) {
    console.error(validateInstruments.errors);
    invariant(false, 'Invalid instruments data.');
  }

  return data;
}
