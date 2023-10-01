// https://demo.tradedirect365.com/UTSAPI%2Easmx/GetMarketQuote
// when trading, check the above endpoint to get the instrument market and quote ids

export interface InstrumentOld {
  readonly name: string;
  readonly marketId: number; // used for downloading ticker data
  readonly quoteId: number; // used for getting realtime quotes
  readonly precision: number;
  readonly dataPrecision: number;
  readonly spread: number;
  readonly minStopLoss: number;
  readonly openTime: string;
  readonly closeTime: string;
  readonly timezone: string
}
