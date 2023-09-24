import { z } from 'zod';
import { parseIntegerOrThrow } from '@gmjs/number-util';
import type { Env } from '../types';
import { LogLevelOrOff } from '../types/generic';

const ENV_SCHEMA = z.object({
  NODE_ENV: z.string(),
  LOG_LEVEL: z
    .string()
    .regex(/^(?:error|warn|info|debug|verbose|off)$/)
    .optional(),
  PORT: z.string().regex(/^\d{1,5}$/),
  API_PREFIX: z.string().regex(/^[\da-z]+(?:-[\da-z])*$/),
  FRONTEND_URL: z.string().url().optional(),
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
    frontendUrl: raw.FRONTEND_URL,
  };
}

function toLogLevel(raw: string | undefined): LogLevelOrOff | undefined {
  return raw ? (raw as LogLevelOrOff) : undefined;
}
