import {
  Td365MetadataFileDay,
  Td365MetadataFileMinute,
  Td365MetadataFileQuarter,
} from './td365-metadata-file';
import { Td365MetadataInstrumentResolution } from './td365-metadata-instrument-resolution';

export interface Td365MetadataInstrumentResolutions {
  readonly day: Td365MetadataInstrumentResolution<Td365MetadataFileDay>;
  readonly quarter: Td365MetadataInstrumentResolution<Td365MetadataFileQuarter>;
  readonly minute: Td365MetadataInstrumentResolution<Td365MetadataFileMinute>;
}
