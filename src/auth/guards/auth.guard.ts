import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from '../../user/user.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException('Unauthorized')
    }

    const user = await this.userService.findById(request.session.userId)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    request.user = user

    return true
  }
}
