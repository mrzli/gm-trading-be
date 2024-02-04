import { Injectable } from '@nestjs/common';
import { ensureNotUndefined } from '@gmjs/assert';
import { mapGetOrThrow } from '@gmjs/data-container-util';
import { applyFn } from '@gmjs/apply-function';
import { toMapBy } from '@gmjs/value-transformers';
import { Instrument } from '@gmjs/gm-trading-shared';
import { DatesData } from '../../types';
import { readDates, readInstruments } from './util';

@Injectable()
export class DataService {
  private _instruments: readonly Instrument[] | undefined;
  private _instrumentMap: ReadonlyMap<string, Instrument> | undefined;
  private _datesData: DatesData | undefined;

  public constructor() {}

  public async getAllInstruments(): Promise<readonly Instrument[]> {
    await this.intializeInstruments();
    return this.instruments;
  }

  public async hasInstrument(name: string): Promise<boolean> {
    await this.intializeInstruments();
    return this.instrumentMap.has(name);
  }

  public async getInstrumentByName(name: string): Promise<Instrument> {
    await this.intializeInstruments();
    const instrument = mapGetOrThrow(this.instrumentMap, name);
    return instrument;
  }

  private async intializeInstruments(): Promise<void> {
    if (this._instruments) {
      return;
    }

    const instruments = await readInstruments();
    this._instruments = instruments;
    this._instrumentMap = applyFn(
      instruments,
      toMapBy((item) => item.name),
    );
  }

  public async getDatesData(): Promise<DatesData> {
    await this.initializeDatesData();
    return ensureNotUndefined(this._datesData);
  }

  private async initializeDatesData(): Promise<void> {
    if (this._datesData) {
      return;
    }

    this._datesData = await readDates();
  }

  private get instruments(): readonly Instrument[] {
    return ensureNotUndefined(this._instruments);
  }

  private get instrumentMap(): ReadonlyMap<string, Instrument> {
    return ensureNotUndefined(this._instrumentMap);
  }
}
