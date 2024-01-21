import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import type { ConfigOptions } from '../../types';
import { ConfigModule } from '../config/config.module';
import { AppModule } from '../app/app.module';
import { LoggerModule } from '../logger/logger.module';
import { DbModule } from '../db/db.module';

@Module({})
export class RootModule implements NestModule {
  public static register(configOptions: ConfigOptions): DynamicModule {
    return {
      module: RootModule,
      imports: [
        LoggerModule,
        ConfigModule.register(configOptions),
        DbModule,
        AppModule,
      ],
      controllers: [],
      providers: [
        // {
        //   provide: APP_INTERCEPTOR,
        //   useClass: SomeInterceptor,
        // },
      ],
      exports: [],
    };
  }

  public configure(_consumer: MiddlewareConsumer): void {
    // add middleware here
    // consumer.apply(SomeMiddleware).forRoutes('*');
  }
}
