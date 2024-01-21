import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MysqlService } from '../db/mysql.service';

@Injectable()
export class ExampleService {
  public constructor(
    private readonly configService: ConfigService,
    private readonly mysqlService: MysqlService,
  ) {}

  public getExample(): string {
    return 'Hello World!';
  }

  public getNodeEnv(): string {
    return this.configService.configOptions.nodeEnv;
  }

  public async getDb(): Promise<string> {
    const result = await this.mysqlService.execute(async (connection) => {
      const [rows] = await connection.query('SELECT 1 + 1 AS solution');
      return rows;
    });

    return JSON.stringify(result);
  }
}
