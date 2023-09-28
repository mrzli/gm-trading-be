import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { readTextAsync } from '@gmjs/fs-async';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TickerDataService {
  private readonly dataDir: string;

  public constructor(configService: ConfigService) {
    const { dataDir } = configService.configOptions;
    this.dataDir = dataDir;
  }

  public async getTickerData(): Promise<readonly string[]> {
    const path = join(this.dataDir, 'DAX/day/all.csv');
    const content = await readTextAsync(path);
    const lines = content.split('\n').filter((line) => line.trim() !== '');
    const result = lines.length > 0 ? lines.slice(1) : [];

    return result;
  }
}
