import { Module } from '@nestjs/common';
import { TickerDataController } from './ticker-data.controller';
import { TickerDataService } from './ticker-data.service';
import { TickerDataMetadataModule } from '../ticker-data-metadata/ticker-data-metadata.module';

@Module({
  imports: [TickerDataMetadataModule],
  controllers: [TickerDataController],
  providers: [TickerDataService],
  exports: [],
})
export class TickerDataModule {}
