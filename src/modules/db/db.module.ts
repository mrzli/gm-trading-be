import { Global, Module } from '@nestjs/common';
import { MysqlService } from './mysql.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [MysqlService],
  exports: [MysqlService],
})
export class DbModule {}
