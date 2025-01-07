import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Options, ProviderOptionSymbol } from './provider.constants'
import { BaseOAuthService } from './services/base-oauth.service'

@Injectable()
export class ProviderService implements OnModuleInit {
  constructor(
    @Inject(ProviderOptionSymbol) private readonly options: Options,
  ) {}

  public onModuleInit() {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.base_url
    }
  }
  public findByService(service: string): BaseOAuthService | null {
    return this.options.services.find((s) => s.name === service) ?? null
  }
}
