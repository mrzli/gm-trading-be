import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { TickerDataModule } from '../ticker-data/ticker-data.module';
import { InstrumentModule } from '../instrument/instrument.module';
import { DataModule } from '../data/data.module';
import { TradeModule } from '../trade/trade.module';
import { StrategyModule } from '../strategy/strategy.module';

@Module({
  imports: [
    DataModule,
    ExampleModule,
    InstrumentModule,
    StrategyModule,
    TickerDataModule,
    TradeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
