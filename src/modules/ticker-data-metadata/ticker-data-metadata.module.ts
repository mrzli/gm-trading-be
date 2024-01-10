import { Module } from '@nestjs/common';
import { TickerDataMetadataService } from './ticker-data-metadata.service';
import { TickerDataMetadataController } from './ticker-data-metadata.controller';

@Module({
  imports: [],
  controllers: [TickerDataMetadataController],
  providers: [TickerDataMetadataService],
  exports: [TickerDataMetadataService],
})
export class TickerDataMetadataModule {}
