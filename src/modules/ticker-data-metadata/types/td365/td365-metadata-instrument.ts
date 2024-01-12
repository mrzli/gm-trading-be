import { Td365MetadataInstrumentResolutions } from './td365-metadata-instrument-resolutions';

export interface Td365MetadataInstrument {
  readonly name: string;
  readonly resolutions: Td365MetadataInstrumentResolutions;
}
