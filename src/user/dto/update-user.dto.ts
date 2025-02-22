import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  displayName: string

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsBoolean()
  isTwoFactorEnabled: boolean
}
