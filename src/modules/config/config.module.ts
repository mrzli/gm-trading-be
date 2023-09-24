import { DynamicModule, Global, Module } from '@nestjs/common';
import type { ConfigOptions } from '../../types';
import { PROVIDER_KEY_CONFIG_OPTIONS } from './provider-keys';
import { ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  public static register(configOptions: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      imports: [],
      providers: [
        {
          provide: PROVIDER_KEY_CONFIG_OPTIONS,
          useValue: configOptions,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
