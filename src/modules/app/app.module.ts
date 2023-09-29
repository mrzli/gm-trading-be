import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { TickerDataModule } from '../ticker-data/ticker-data.module';
import { InstrumentModule } from '../instrument/instrument.module';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule, ExampleModule, InstrumentModule, TickerDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
