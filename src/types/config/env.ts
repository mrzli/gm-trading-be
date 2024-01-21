import { LogLevelOrOff } from '../generic';

export interface Env {
  readonly nodeEnv: string;
  readonly logLevel: LogLevelOrOff | undefined;
  readonly port: number;
  readonly apiPrefix: string;
  readonly corsAllowedOrigins: readonly string[] | undefined;
  readonly td365DataDir: string;
  readonly dbHost: string;
  readonly dbPort: number;
  readonly dbUser: string;
  readonly dbPassword: string;
  readonly dbName: string;
}
