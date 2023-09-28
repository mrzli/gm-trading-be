import { Module } from '@nestjs/common';
import { ExampleModule } from '../example/example.module';
import { TickerDataModule } from '../ticker-data/ticker-data.module';

@Module({
  imports: [ExampleModule, TickerDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
