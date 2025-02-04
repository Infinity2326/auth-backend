import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class NewPasswordDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string
}
