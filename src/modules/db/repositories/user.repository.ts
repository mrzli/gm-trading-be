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

    return {
      id: result['id'],
      email: result['email'],
      created_at: result['created_at'],
      updated_at: result['updated_at'],
    }
  }
}
