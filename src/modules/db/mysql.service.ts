import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mysql from 'mysql2/promise';
import { ConfigService } from '../config/config.service';
import { DbOptions } from '../../types';
import { ensureNotUndefined } from '@gmjs/assert';

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private readonly dbOptions: DbOptions;
  private _pool: mysql.Pool | undefined;

  public constructor(private readonly configService: ConfigService) {
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

    console.log('init');
  }

  public async onModuleDestroy(): Promise<void> {
    this._pool?.end();
  }

  private get pool(): mysql.Pool {
    return ensureNotUndefined(this._pool);
  }

  public async execute<T = void>(doWork: ExecuteSql<T>): Promise<T> {
    let connection: mysql.PoolConnection | undefined;
    try {
      connection = await this.pool.getConnection();
      return await doWork(connection);
    } finally {
      connection?.release();
    }
  }
}

export type ExecuteSql<T> = (connection: mysql.PoolConnection) => Promise<T>;
