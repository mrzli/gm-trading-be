export const LOG_LEVEL_LIST = [
  'error',
  'warn',
  'info',
  'debug',
  'verbose',
] as const;

export type LogLevel = (typeof LOG_LEVEL_LIST)[number];

export type LogLevelOrOff = LogLevel | 'off';
