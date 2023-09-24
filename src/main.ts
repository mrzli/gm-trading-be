import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import {
  NestAppBootstrapOptions,
  bootstrapNestApp,
  createConfigOptions,
  parseEnv,
} from './setup';
import type { ConfigOptions } from './types';
import { RootModule } from './modules/root/root.module';
import { AppLoggerService } from './modules/logger/app-logger.service';

const NODE_ENV = process.env['NODE_ENV'];

if (NODE_ENV === undefined || NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const CONFIG_OPTIONS: ConfigOptions = createConfigOptions(
  parseEnv(process.env),
);

async function bootstrap(): Promise<void> {
  const rootModule = RootModule.register(CONFIG_OPTIONS);
  const app = await NestFactory.create(rootModule);
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const options: NestAppBootstrapOptions = {
    port: CONFIG_OPTIONS.port,
    globalPrefix: CONFIG_OPTIONS.apiPrefix,
    frontendUrl: CONFIG_OPTIONS.frontendUrl,
  };

  await bootstrapNestApp(app, logger, options);
}

bootstrap();
