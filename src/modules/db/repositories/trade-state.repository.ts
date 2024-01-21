import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';
import { MysqlService, QueryValue } from '../mysql.service';
import { DbTradeState } from '../types';
import { NonRequiredOnly } from '../../../types';

@Injectable()
export class TradeStateRepository {
  public constructor(private readonly mysqlService: MysqlService) {}

  public async findAllForUser(
    userId: number,
  ): Promise<readonly DbTradeState[]> {
    const result = await this.mysqlService.findMany(
      'SELECT * FROM trade_state WHERE user_id = ?',
      [userId],
    );

    return result.map((item) => rowDataPacketToDbTradeState(item));
  }

  public async upsert(
    key: Pick<DbTradeState, 'user_id' | 'save_name'>,
    data: NonRequiredOnly<
      DbTradeState,
      'id' | 'user_id' | 'save_name' | 'created_at' | 'updated_at'
    >,
  ): Promise<void> {
    const { user_id, save_name } = key;
    const {
      ticker_data_source,
      ticker_name,
      ticker_resolution,
      timezone,
      bar_index,
      trading_parameters,
      manual_trade_actions,
    } = data;

    const sql = [
      'INSERT INTO trade_state(',
      '  user_id,',
      '  ticker_name,',
      '  ticker_data_source,',
      '  ticker_name,',
      '  ticker_resolution,',
      '  timezone,',
      '  bar_index,',
      '  trading_parameters,',
      '  manual_trade_actions)',
      ')',
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'ON DUPLICATE KEY UPDATE',
      '  user_id = ?,',
      '  save_name = ?,',
      '  ticker_data_source = ?,',
      '  ticker_name = ?,',
      '  ticker_resolution = ?,',
      '  timezone = ?,',
      '  bar_index = ?,',
      '  trading_parameters = ?,',
      '  manual_trade_actions = ?',
    ].join('\n');
    const values: readonly QueryValue[] = [
      user_id,
      save_name,
      ticker_data_source,
      ticker_name,
      ticker_resolution,
      timezone,
      bar_index,
      trading_parameters,
      manual_trade_actions,
    ];
    await this.mysqlService.executeNonQuery(sql, [...values, ...values]);
  }
}

function rowDataPacketToDbTradeState(row: RowDataPacket): DbTradeState {
  return {
    id: row['id'],
    user_id: row['user_id'],
    save_name: row['save_name'],
    ticker_data_source: row['ticker_data_source'],
    ticker_name: row['ticker_name'],
    ticker_resolution: row['ticker_resolution'],
    timezone: row['timezone'],
    bar_index: row['bar_index'],
    trading_parameters: row['trading_parameters'],
    manual_trade_actions: row['manual_trade_actions'],
    created_at: row['created_at'],
    updated_at: row['updated_at'],
  };
}
