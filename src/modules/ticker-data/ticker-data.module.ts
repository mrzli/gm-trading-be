import { Module } from '@nestjs/common';
import { TickerDataController } from './ticker-data.controller';
import { TickerDataService } from './ticker-data.service';
import { TickerDataMetadataModule } from '../ticker-data-metadata/ticker-data-metadata.module';
import { TickerDataTd365Service } from './ticker-data-td365.service';

@Module({
  imports: [TickerDataMetadataModule],
  controllers: [TickerDataController],
  providers: [TickerDataService, TickerDataTd365Service],
  exports: [],
})
export class TickerDataModule {}
