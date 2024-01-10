import { Injectable } from '@nestjs/common';
import { Td365Metadata } from './types';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TickerDataMetadataService {
  public constructor(private readonly configService: ConfigService) {}

  public async getTd365DataMetadata(): Promise<Td365Metadata> {
    const { td365DataDir } = this.configService.configOptions;

    return {
      dataDir: td365DataDir,
      instruments: new Map(),
    };
  }
}
