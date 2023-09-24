import { LogLevelOrOff } from './generic';

export interface Env {
  readonly nodeEnv: string;
  readonly logLevel: LogLevelOrOff | undefined;
  readonly port: number;
  readonly apiPrefix: string;
  readonly frontendUrl: string | undefined;
}
