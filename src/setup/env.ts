import { z } from 'zod';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import type { Env } from '../types';
import { LogLevelOrOff } from '../types/generic';

const SCHEMA_COMMA_SEPARATED_URLS = z.string().refine(
  (v) => {
    const urls = v.split(',');
    return urls.every(
      (url) => z.string().nonempty().url().safeParse(url).success,
    );
  },
  {
    message: 'Must be a comma separated list of URLs',
  },
);

const ENV_SCHEMA = z.object({
  NODE_ENV: z.string().min(1),
  LOG_LEVEL: z
    .string()
    .regex(/^(?:error|warn|info|debug|verbose|off)$/)
    .optional(),
  PORT: z.string().regex(/^\d{1,5}$/),
  API_PREFIX: z.string().regex(/^[\da-z]+(?:-[\da-z])*$/),
  CORS_ALLOWED_ORIGINS: SCHEMA_COMMA_SEPARATED_URLS.optional(),
  TD365_DATA_DIR: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().regex(/^\d{1,5}$/),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
});

type EnvRaw = z.infer<typeof ENV_SCHEMA>;

export function parseEnv(env: NodeJS.ProcessEnv): Env {
  const raw = ENV_SCHEMA.parse(env);
  return envRawToEnv(raw);
}

function envRawToEnv(raw: EnvRaw): Env {
  return {
    nodeEnv: raw.NODE_ENV,
    logLevel: toLogLevel(raw.LOG_LEVEL),
    port: parseIntegerOrThrow(raw.PORT),
    apiPrefix: raw.API_PREFIX,
    corsAllowedOrigins: toCorsAllowedOrigins(raw.CORS_ALLOWED_ORIGINS),
    td365DataDir: raw.TD365_DATA_DIR,
    dbHost: raw.DB_HOST,
    dbPort: parseIntegerOrThrow(raw.DB_PORT),
    dbUser: raw.DB_USER,
    dbPassword: raw.DB_PASSWORD,
    dbName: raw.DB_NAME,
  };
}

function toLogLevel(raw: string | undefined): LogLevelOrOff | undefined {
  return raw ? (raw as LogLevelOrOff) : undefined;
}

function toCorsAllowedOrigins(
  raw: string | undefined,
): readonly string[] | undefined {
  return raw ? raw.split(',') : undefined;
}
