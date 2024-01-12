import { Injectable } from '@nestjs/common';
import { TickerDataMetadataTd365Service } from './ticker-data-metadata-td365.service';
import { Td365MetadataInstrument } from './types';

@Injectable()
export class TickerDataMetadataService {
  public constructor(
    private readonly tickerDataMetadataTd365Service: TickerDataMetadataTd365Service,
  ) {}

  public async getTd365Metadata(
    instrumentName: string,
  ): Promise<Td365MetadataInstrument> {
    return this.tickerDataMetadataTd365Service.getMetadata(instrumentName);
  }
}
