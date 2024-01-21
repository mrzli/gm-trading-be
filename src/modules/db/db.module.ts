import { Global, Module } from '@nestjs/common';
import { MysqlService } from './mysql.service';
import { TradeStateRepository, UserRepository } from './repositories';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [MysqlService, TradeStateRepository, UserRepository],
  exports: [MysqlService, TradeStateRepository, UserRepository],
})
export class DbModule {}
