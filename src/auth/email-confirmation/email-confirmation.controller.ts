import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common'
import { EmailConfirmationService } from './email-confirmation.service'
import { Request } from 'express'
import { ConfirmationDto } from './dto/confirmation.dto'

@Controller('auth/email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public async newVerifcation(
    @Req() request: Request,
    @Body() data: ConfirmationDto,
  ) {
    return this.emailConfirmationService.newVerification(request, data)
  }
}
