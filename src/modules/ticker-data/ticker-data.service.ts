import { BadRequestException, Injectable } from '@nestjs/common';
import { TickerDataRequest, TickerDataResponse } from '@gmjs/gm-trading-shared';
import { ConfigService } from '../config/config.service';
import { DataService } from '../data/data.service';
import { getDataPaths, readData } from './util';

const MIN_FETCHED_ENTRIES = 1000;

@Injectable()
export class TickerDataService {
  private readonly dataDir: string;

  public constructor(
    configService: ConfigService,
    private readonly dataService: DataService,
  ) {
    const { dataDir } = configService.configOptions;
    this.dataDir = dataDir;
  }

  public async getTickerData(
    input: TickerDataRequest,
  ): Promise<TickerDataResponse> {
    const { name, resolution, from, to } = input;

    const instruments = await this.dataService.getAllInstruments();
    const instrumentNames = new Set(
      instruments.map((instrument) => instrument.name),
    );
    if (!instrumentNames.has(name)) {
      throw new BadRequestException(`Instrument with name ${name} not found.`);
    }

    const instrument = await this.dataService.getInstrumentByName(name);

    const paths = await getDataPaths(input, this.dataDir);

    const data = await readData(paths, MIN_FETCHED_ENTRIES);

    return {
      instrument,
      resolution,
      from,
      to,
      data,
    };
  }
}
