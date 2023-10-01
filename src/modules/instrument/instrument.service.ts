import { Injectable } from '@nestjs/common';
import { Instrument } from '@gmjs/gm-trading-shared';
import { DataService } from '../data/data.service';

@Injectable()
export class InstrumentService {
  public constructor(private readonly dataService: DataService) {}

  public async getAll(): Promise<readonly Instrument[]> {
    return await this.dataService.getAllInstruments();
  }

  public async getByName(name: string): Promise<Instrument> {
    return await this.dataService.getInstrument(name);
  }
}
