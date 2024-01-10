import { Td365MetadataInstrument } from './td365-metadata-instrument';

export interface Td365Metadata {
  readonly dataDir: string;
  readonly instruments: ReadonlyMap<string, Td365MetadataInstrument>;
}
