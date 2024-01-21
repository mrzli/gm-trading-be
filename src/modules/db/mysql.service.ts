import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mysql, {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { ConfigService } from '../config/config.service';
import { DbOptions } from '../../types';
import { ensureNotUndefined, invariant } from '@gmjs/assert';

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private readonly dbOptions: DbOptions;
  private _pool: Pool | undefined;

  public constructor(configService: ConfigService) {
    this.dbOptions = configService.configOptions.db;
  }

  public async onModuleInit(): Promise<void> {
    const { host, port, user, password, name } = this.dbOptions;

    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database: name,
    });

    this._pool = pool;
  }

  public async onModuleDestroy(): Promise<void> {
    this._pool?.end();
  }

  private get pool(): Pool {
    return ensureNotUndefined(this._pool);
  }

  public async findMany(
    sql: string,
    values?: readonly QueryValue[],
  ): Promise<readonly RowDataPacket[]> {
    return await this.execute(async (connection) => {
      const [rows] = await connection.execute<RowDataPacket[]>(sql, values);
      return rows;
    });
  }

  public async findOne(
    sql: string,
    values?: readonly QueryValue[],
  ): Promise<RowDataPacket | undefined> {
    return await this.execute(async (connection) => {
      const [rows] = await connection.execute<RowDataPacket[]>(sql, values);
      invariant(rows.length <= 1, 'Expected at most one row.');
      return rows.length > 0 ? rows[0] : undefined;
    });
  }

  public async findOneOrThrow(
    sql: string,
    values?: readonly QueryValue[],
  ): Promise<RowDataPacket> {
    return await this.execute(async (connection) => {
      const [rows] = await connection.execute<RowDataPacket[]>(sql, values);
      invariant(rows.length === 1, 'Expected exactly one row.');
      return rows[0];
    });
  }

  public async executeNonQuery(
    sql: string,
    values?: readonly QueryValue[],
  ): Promise<ResultSetHeader> {
    return await this.execute(async (connection) => {
      const [result] = await connection.execute<ResultSetHeader>(sql, values);
      return result;
    });
  }

  private async execute<T = void>(doWork: ExecuteSql<T>): Promise<T> {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.pool.getConnection();
      return await doWork(connection);
    } finally {
      connection?.release();
    }
  }
}

export type QueryValue = string | number | boolean | Date | null;

export type ExecuteSql<T> = (connection: PoolConnection) => Promise<T>;
