import { RunStrategyRequest } from '@gmjs/gm-trading-shared';
import { Injectable } from '@nestjs/common';
import { TickerDataService } from '../ticker-data/ticker-data.service';
import {
  StrategyBreakoutContext,
  createStrategyBarProcessingBreakout,
  processStrategy,
  toBars,
} from './util';
import { StrategyInputs } from './types';
import { InstrumentService } from '../instrument/instrument.service';

@Injectable()
export class StrategyService {
  public constructor(
    private readonly instrumentService: InstrumentService,
    private readonly tickerDataService: TickerDataService,
  ) {}

  public async runStrategy(input: RunStrategyRequest): Promise<void> {
    const {
      instrumentSource,
      instrumentName,
      instrumentResolution,
      tradingParameters,
    } = input;

    const instrument = await this.instrumentService.getByName(instrumentName);

    const tickerData = await this.tickerDataService.getTickerData({
      source: instrumentSource,
      name: instrumentName,
      resolution: instrumentResolution,
    });

    const { data: rawData } = tickerData;

    const data = toBars(rawData);

    const strategyInputs: StrategyInputs = {
      instrument,
      params: tradingParameters,
      data
    };

    const strategy = createStrategyBarProcessingBreakout({});

    const initialContext: StrategyBreakoutContext = {
      nextTriggerCheckTime: 0,
      nextCloseCheckTime: 0,
    };

    const result = processStrategy(strategyInputs, strategy, initialContext);

    console.log('result', result);
  }
}
