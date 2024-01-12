import { Td365MetadataFileAny } from './td365-metadata-file';

export interface Td365MetadataInstrumentResolution<
  TMetadataFile extends Td365MetadataFileAny,
> {
  readonly totalLines: number;
  readonly startDate: number;
  readonly endDate: number;
  readonly files: readonly TMetadataFile[];
}
