import { TickerDataResolution } from '@gmjs/gm-trading-shared';

export interface Td365MetadataFileBase {
  readonly resolution: TickerDataResolution;
  readonly numLines: number;
  readonly startLine: number;
  readonly endLine: number;
  readonly startDate: number;
  readonly endDate: number;
}

export interface Td365MetadataFileDay extends Td365MetadataFileBase {
  readonly resolution: 'day';
}

export interface Td365MetadataFileQuarter extends Td365MetadataFileBase {
  readonly resolution: 'quarter';
  readonly year: number;
}

export interface Td365MetadataFileMinute extends Td365MetadataFileBase {
  readonly resolution: 'minute';
  readonly year: number;
  readonly month: number;
}

export type Td365MetadataFileAny =
  | Td365MetadataFileDay
  | Td365MetadataFileQuarter
  | Td365MetadataFileMinute;
