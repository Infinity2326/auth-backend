import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ProviderService } from '../provider/provider.service'

@Injectable()
export class AuthProviderGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const provider = request.params.provider
    const providerInstance = this.providerService.findByService(provider)
    if (!providerInstance) {
      throw new NotFoundException('Provider not found')
    }
    return true
  }
}
