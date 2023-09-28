import type { ConfigOptions, Env } from '../types';

export function createConfigOptions(env: Env): ConfigOptions {
  return {
    nodeEnv: env.nodeEnv,
    logLevel: env.logLevel ?? 'debug',
    port: env.port,
    apiPrefix: env.apiPrefix,
    corsAllowedOrigins: env.corsAllowedOrigins,
    dataDir: env.dataDir,
  };
}
