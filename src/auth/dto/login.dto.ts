import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
