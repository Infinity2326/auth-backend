import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  displayName: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  passwordRepeat: string
}
