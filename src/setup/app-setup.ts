import { INestApplication, LoggerService } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Except } from 'type-fest';

export interface NestAppBootstrapOptions {
  readonly port: number;
  readonly globalPrefix: string;
  readonly corsAllowedOrigins: readonly string[] | undefined;
}

export type NestAppSetupOptions = Except<NestAppBootstrapOptions, 'port'>;

export async function bootstrapNestApp(
  app: INestApplication,
  logger: LoggerService,
  options: NestAppBootstrapOptions,
): Promise<void> {
  const { port, globalPrefix, corsAllowedOrigins } = options;

  setupNestApp(app, { globalPrefix, corsAllowedOrigins });
  await app.listen(port);
  logger.debug?.(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

export function setupNestApp(
  app: INestApplication,
  options: NestAppSetupOptions,
): void {
  const { globalPrefix, corsAllowedOrigins } = options;

  if (corsAllowedOrigins !== undefined) {
    app.enableCors({
      origin: [...corsAllowedOrigins],
    });
  }
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(cookieParser());
}
