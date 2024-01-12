import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  filter,
  lastValueFrom,
  map as mapRx,
  toArray as toArrayRx,
} from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { join, pathFsName } from '@gmjs/path';
import { mapGetOrThrow } from '@gmjs/data-container-util';
import { TickerDataResolution } from '@gmjs/gm-trading-shared';
import { existsAsync, readTextAsync } from '@gmjs/fs-async';
import {
  Td365MetadataFileAny,
  Td365MetadataFileBase,
  Td365MetadataFileDay,
  Td365MetadataFileMinute,
  Td365MetadataFileQuarter,
  Td365MetadataInstrument,
  Td365MetadataInstrumentResolution,
} from './types';
import { ConfigService } from '../config/config.service';
import {
  getTickerDataLineTimestamp,
  tickerDataContentToLines,
} from '../../util';
import { parseIntegerOrThrow } from '@gmjs/number-util';

@Injectable()
export class TickerDataMetadataTd365Service {
  private readonly dataDir: string;

  private instrumentNames: ReadonlySet<string> | undefined;
  private metadata: Map<string, Td365MetadataInstrument> = new Map();

  public constructor(private readonly configService: ConfigService) {
    this.dataDir = configService.configOptions.td365DataDir;
  }

  public async getMetadata(
    instrumentName: string,
  ): Promise<Td365MetadataInstrument> {
    await this.ensureInstrumentExists(instrumentName);

    if (!this.metadata.has(instrumentName)) {
      const metadata = await loadInstrumentMetadata(
        this.dataDir,
        instrumentName,
      );
      this.metadata.set(instrumentName, metadata);
    }

    return mapGetOrThrow(this.metadata, instrumentName);
  }

  private async ensureInstrumentExists(instrumentName: string): Promise<void> {
    if (this.instrumentNames === undefined) {
      this.instrumentNames = await loadInstrumentNames(this.dataDir);
    }

    if (!this.instrumentNames.has(instrumentName)) {
      throw new BadRequestException(
        `Directory for instrument with name does not exist: '${instrumentName}'.`,
      );
    }
  }
}

async function loadInstrumentNames(
  dataDir: string,
): Promise<ReadonlySet<string>> {
  const instrumentNames = await lastValueFrom(
    fromFindFsEntries(dataDir).pipe(
      filter((entry) => entry.stats.isDirectory()),
      mapRx((entry) => pathFsName(entry.path)),
      toArrayRx(),
    ),
  );

  return new Set(instrumentNames);
}

async function loadInstrumentMetadata(
  dataDir: string,
  instrumentName: string,
): Promise<Td365MetadataInstrument> {
  const instrumentDir = join(dataDir, instrumentName);

  const day = await loadInstrumentResolutionMetadata<Td365MetadataFileDay>(
    instrumentDir,
    'D',
    (_path: string, sharedData: FileSharedData): Td365MetadataFileDay => {
      return {
        resolution: 'D',
        ...sharedData,
      };
    },
  );

  const quarter =
    await loadInstrumentResolutionMetadata<Td365MetadataFileQuarter>(
      instrumentDir,
      '15m',
      (path: string, sharedData: FileSharedData): Td365MetadataFileQuarter => {
        const fileName = pathFsName(path);
        const match = fileName.match(/^(\d{4})$/);
        if (!match) {
          throw new InternalServerErrorException(
            `Invalid quarter resolution file name: '${fileName}'. Expected a year.`,
          );
        }

        const year = parseIntegerOrThrow(match[1]);

        return {
          resolution: '15m',
          ...sharedData,
          year,
        };
      },
    );

  const minute =
    await loadInstrumentResolutionMetadata<Td365MetadataFileMinute>(
      instrumentDir,
      '1m',
      (path: string, sharedData: FileSharedData): Td365MetadataFileMinute => {
        const fileName = pathFsName(path);
        const match = fileName.match(/^(\d{4})-(\d{2})$/);
        if (!match) {
          throw new InternalServerErrorException(
            `Invalid minute resolution file name: '${fileName}'. Expected a year and month.`,
          );
        }

        const year = parseIntegerOrThrow(match[1]);
        const month = parseIntegerOrThrow(match[2]);

        return {
          resolution: '1m',
          ...sharedData,
          year,
          month,
        };
      },
    );

  return {
    name: instrumentName,
    resolutions: {
      day,
      quarter,
      minute,
    },
  };
}

async function loadInstrumentResolutionMetadata<
  TMetadataFile extends Td365MetadataFileAny,
>(
  instrumentDir: string,
  resolution: TickerDataResolution,
  fileMetadataCreator: (
    path: string,
    sharedData: FileSharedData,
  ) => TMetadataFile,
): Promise<Td365MetadataInstrumentResolution<TMetadataFile>> {
  const resolutionDir = join(instrumentDir, resolution);

  const filePaths = await lastValueFrom(
    fromFindFsEntries(resolutionDir).pipe(
      filter((entry) => entry.stats.isFile()),
      mapRx((entry) => entry.path),
      toArrayRx(),
    ),
  );

  if (filePaths.some((p) => !p.endsWith('.csv'))) {
    throw new InternalServerErrorException(
      `Some file(s) in '${resolutionDir}' are not CSV files.`,
    );
  }

  if (filePaths.length === 0) {
    throw new InternalServerErrorException(
      `No CSV files found in '${resolutionDir}'.`,
    );
  }

  let currentStartLine = 0;
  const fileMetadatas: TMetadataFile[] = [];

  for (const filePath of filePaths) {
    const fileInfo = await getDataFileInfo(filePath);
    const { numLines } = fileInfo;

    const fileMetadata = fileMetadataCreator(
      filePath,
      toSharedData(fileInfo, currentStartLine),
    );
    fileMetadatas.push(fileMetadata);

    currentStartLine += numLines;
  }

  return {
    totalLines: currentStartLine,
    startDate: fileMetadatas[0].startDate,
    endDate: fileMetadatas.at(-1)!.endDate,
    files: fileMetadatas,
  };
}

interface DataFileInfo {
  readonly numLines: number;
  readonly startDate: number;
  readonly endDate: number;
}

async function getDataFileInfo(path: string): Promise<DataFileInfo> {
  const exists = await existsAsync(path);
  if (!exists) {
    throw new InternalServerErrorException(
      `Ticker data file does not exist: '${path}'.`,
    );
  }

  const content = await readTextAsync(path);
  const lines = tickerDataContentToLines(content);
  if (lines.length === 0) {
    throw new InternalServerErrorException(
      `Ticker data file is empty: '${path}'.`,
    );
  }

  const startDate = getTickerDataLineTimestamp(lines[0]);
  const endDate = getTickerDataLineTimestamp(lines.at(-1)!);

  return {
    numLines: lines.length,
    startDate,
    endDate,
  };
}

type FileSharedData = Omit<Td365MetadataFileBase, 'resolution'>;

function toSharedData(
  fileInfo: DataFileInfo,
  startLine: number,
): FileSharedData {
  const { numLines, startDate, endDate } = fileInfo;

  return {
    numLines,
    startLine,
    endLine: startLine + numLines - 1,
    startDate,
    endDate,
  };
}
