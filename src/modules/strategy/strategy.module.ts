import { Module } from '@nestjs/common';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { TickerDataModule } from '../ticker-data/ticker-data.module';
import { InstrumentModule } from '../instrument/instrument.module';

@Module({
  imports: [InstrumentModule, TickerDataModule],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [],
})
export class StrategyModule {}
