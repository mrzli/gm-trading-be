import { LogLevelOrOff } from '../generic';
import { DbOptions } from './db-options';

export interface ConfigOptions {
  readonly nodeEnv: string;
  readonly logLevel: LogLevelOrOff;
  readonly port: number;
  readonly apiPrefix: string;
  readonly corsAllowedOrigins: readonly string[] | undefined;
  readonly td365DataDir: string;
  readonly db: DbOptions;
}
