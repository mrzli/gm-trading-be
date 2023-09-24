import { INestApplication, LoggerService } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Except } from 'type-fest';

export interface NestAppBootstrapOptions {
  readonly port: number;
  readonly globalPrefix: string;
  readonly frontendUrl: string | undefined;
}

export type NestAppSetupOptions = Except<NestAppBootstrapOptions, 'port'>;

export async function bootstrapNestApp(
  app: INestApplication,
  logger: LoggerService,
  options: NestAppBootstrapOptions,
): Promise<void> {
  const { port, globalPrefix, frontendUrl } = options;

  setupNestApp(app, { globalPrefix, frontendUrl });
  await app.listen(port);
  logger.debug?.(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

export function setupNestApp(
  app: INestApplication,
  options: NestAppSetupOptions,
): void {
  const { globalPrefix, frontendUrl } = options;

  if (frontendUrl) {
    app.enableCors({ origin: frontendUrl });
  }
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(cookieParser());
}
