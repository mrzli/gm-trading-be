import { Module } from '@nestjs/common';
import { TickerDataController } from './ticker-data.controller';
import { TickerDataService } from './ticker-data.service';

@Module({
  imports: [],
  controllers: [TickerDataController],
  providers: [TickerDataService],
  exports: [],
})
export class TickerDataModule {}
