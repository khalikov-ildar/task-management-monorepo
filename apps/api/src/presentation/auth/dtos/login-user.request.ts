import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { RegisterUserExample } from './register-user.request';

export class LoginUserRequest {
  @ApiProperty({ example: RegisterUserExample.emailExample })
  @IsEmail()
  email: string;

  @ApiProperty({ example: RegisterUserExample.passwordExample })
  @IsString()
  password: string;
}
