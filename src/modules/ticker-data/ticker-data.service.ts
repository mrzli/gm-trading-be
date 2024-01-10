import { BadRequestException, Injectable } from '@nestjs/common';
import { TickerDataRequest, TickerDataResponse } from '@gmjs/gm-trading-shared';
import { DataService } from '../data/data.service';
import { getDataPaths, readData } from './util';
import { TickerDataMetadataService } from '../ticker-data-metadata/ticker-data-metadata.service';

const DATA_ENTRIES_PADDING = 1_000_000;

@Injectable()
export class TickerDataService {
  public constructor(
    private readonly tickerDataMetadataService: TickerDataMetadataService,
    private readonly dataService: DataService,
  ) {}

  public async getTickerData(
    input: TickerDataRequest,
  ): Promise<TickerDataResponse> {
    const { name, resolution, date } = input;

    const instruments = await this.dataService.getAllInstruments();
    const instrumentNames = new Set(
      instruments.map((instrument) => instrument.name),
    );
    if (!instrumentNames.has(name)) {
      throw new BadRequestException(`Instrument with name ${name} not found.`);
    }

    const instrument = await this.dataService.getInstrumentByName(name);

    const metadata =
      await this.tickerDataMetadataService.getTd365DataMetadata();
    const { dataDir } = metadata;

    const paths = await getDataPaths(input, dataDir);

    const { data, limitStart, limitEnd } = await readData(
      input,
      paths,
      DATA_ENTRIES_PADDING,
    );

    return {
      instrument,
      resolution,
      date,
      data,
      limitStart,
      limitEnd,
    };
  }
}
