import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from '../../user/user.service'
import { Request, Response } from 'express'
import { User } from '../../../prisma/__generated__'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as UserRequest
    const response = context.switchToHttp().getResponse() as Response

    if (!request.session?.userId) {
      if (request.cookies.session) {
        this.invalidateSession(response)
      }
      throw new UnauthorizedException('Unauthorized')
    }

    const user = await this.userService.findById(request.session.userId)

    if (!user) {
      if (request.cookies.session) {
        this.invalidateSession(response)
      }
      throw new UnauthorizedException('User not found')
    }

    request.user = user

    return true
  }

  private invalidateSession(response: Response) {
    response.clearCookie('session')
  }
}

interface UserRequest extends Request {
  user?: User
}
