import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { RegisterUserExample } from './register-user.request';

export class EmailConfirmationRequest {
  @IsEmail()
  @ApiProperty({ example: RegisterUserExample.emailExample })
  email: string;
}
