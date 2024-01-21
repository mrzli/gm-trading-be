export interface DbTradeState {
  readonly id: number;
  readonly user_id: number;
  readonly save_name: string;
  readonly ticker_data_source: string;
  readonly ticker_name: string;
  readonly ticker_resolution: string;
  readonly timezone: string;
  readonly bar_index: number;
  readonly trading_parameters: string;
  readonly manual_trade_actions: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}
