import { Global, Module } from '@nestjs/common';
import { MysqlService } from './mysql.service';
import { UserRepository } from './repositories';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [MysqlService, UserRepository],
  exports: [MysqlService, UserRepository],
})
export class DbModule {}
