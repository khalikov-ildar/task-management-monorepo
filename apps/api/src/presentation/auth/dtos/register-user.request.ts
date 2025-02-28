import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterUserExample {
  public static readonly usernameExample = 'Luke Skywalker';
  public static readonly passwordExample = 'Cool P@ssword';
  public static readonly emailExample = 'luke.skywalker@gmail.com';
}

export class RegisterUserRequest {
  @ApiProperty({ example: RegisterUserExample.usernameExample })
  @IsString()
  username: string;

  @ApiProperty({ example: RegisterUserExample.passwordExample })
  @IsString()
  password: string;

  @ApiProperty({ example: RegisterUserExample.emailExample })
  @IsEmail()
  email: string;
}
