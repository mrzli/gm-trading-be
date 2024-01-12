import { Module } from '@nestjs/common';
import { TickerDataMetadataService } from './ticker-data-metadata.service';
import { TickerDataMetadataController } from './ticker-data-metadata.controller';
import { TickerDataMetadataTd365Service } from './ticker-data-metadata-td365.service';

@Module({
  imports: [],
  controllers: [TickerDataMetadataController],
  providers: [TickerDataMetadataService, TickerDataMetadataTd365Service],
  exports: [TickerDataMetadataService],
})
export class TickerDataMetadataModule {}
