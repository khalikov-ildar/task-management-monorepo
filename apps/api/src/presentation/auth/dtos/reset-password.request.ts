import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RegisterUserExample } from './register-user.request';

export class ResetPasswordRequest {
  @IsString()
  @ApiProperty({ example: RegisterUserExample.passwordExample })
  password: string;
}
