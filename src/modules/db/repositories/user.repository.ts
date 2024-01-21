import { RowDataPacket } from 'mysql2/promise';
import { Injectable } from '@nestjs/common';
import { MysqlService } from '../mysql.service';
import { DbUser } from '../types';

@Injectable()
export class UserRepository {
  public constructor(private readonly mysqlService: MysqlService) {}

  public async findOneOrThrow(userId: number): Promise<DbUser> {
    const result = await this.mysqlService.findOneOrThrow(
      'SELECT * FROM user WHERE id = ?',
      [userId],
    );

    return rowDataPacketToDbUser(result);
  }
}

function rowDataPacketToDbUser(row: RowDataPacket): DbUser {
  return {
    id: row['id'],
    email: row['email'],
    created_at: row['created_at'],
    updated_at: row['updated_at'],
  };
}
