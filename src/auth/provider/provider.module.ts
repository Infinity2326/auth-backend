import { DynamicModule, Module } from '@nestjs/common'
import { ProviderService } from './provider.service'
import {
  AsyncOptions,
  Options,
  ProviderOptionSymbol,
} from './provider.constants'

@Module({})
export class ProviderModule {
  public static register(options: Options): DynamicModule {
    return {
      module: ProviderModule,
      providers: [
        {
          useValue: options.services,
          provide: ProviderOptionSymbol,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    }
  }

  public static registerAsync(options: AsyncOptions): DynamicModule {
    return {
      module: ProviderModule,
      imports: options.imports,
      providers: [
        {
          useFactory: options.useFactory,
          provide: ProviderOptionSymbol,
          inject: options.inject,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    }
  }
}
