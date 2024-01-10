import {
  Td365MetadataFileDay,
  Td365MetadataFileMinute,
  Td365MetadataFileQuarter,
} from './td365-metadata-file';

export interface Td365MetadataInstrument {
  readonly name: string;
  readonly fileDay: Td365MetadataFileDay;
  readonly filesQuarter: readonly Td365MetadataFileQuarter[];
  readonly filesMinute: readonly Td365MetadataFileMinute[];
}
