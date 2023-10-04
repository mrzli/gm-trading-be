export interface DateRelativeFiles {
  readonly before: readonly string[];
  readonly current: string | undefined;
  readonly after: readonly string[];
}

export interface BeforeAfterData {
  readonly before: readonly string[];
  readonly after: readonly string[];
}

export interface YearMonth {
  readonly year: number;
  readonly month: number;
}
