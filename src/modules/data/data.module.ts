import { Global, Module } from '@nestjs/common';
import { DataService } from './data.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
