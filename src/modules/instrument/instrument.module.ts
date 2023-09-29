import { Module } from '@nestjs/common';
import { InstrumentController } from './instrument.controller';
import { InstrumentService } from './instrument.service';

@Module({
  imports: [],
  controllers: [InstrumentController],
  providers: [InstrumentService],
  exports: [],
})
export class InstrumentModule {}
