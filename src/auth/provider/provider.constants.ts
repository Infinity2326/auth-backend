import { FactoryProvider, ModuleMetadata } from '@nestjs/common'
import { BaseOAuthService } from './services/base-oauth.service'

export const ProviderOptionSymbol = Symbol()

export type Options = {
  base_url: string
  services: BaseOAuthService[]
}

export type AsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<Options>, 'useFactory' | 'inject'>
