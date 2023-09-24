import { LogLevelOrOff } from './generic';

export interface ConfigOptions {
  readonly nodeEnv: string;
  readonly logLevel: LogLevelOrOff;
  readonly port: number;
  readonly apiPrefix: string;
  readonly frontendUrl: string | undefined;
}
