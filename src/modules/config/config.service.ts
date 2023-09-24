import { Inject, Injectable } from '@nestjs/common';
import type { ConfigOptions } from '../../types';
import { PROVIDER_KEY_CONFIG_OPTIONS } from './provider-keys';

@Injectable()
export class ConfigService {
  public constructor(
    @Inject(PROVIDER_KEY_CONFIG_OPTIONS)
    private readonly _configOptions: ConfigOptions,
  ) {}

  public get configOptions(): ConfigOptions {
    return this._configOptions;
  }
}
