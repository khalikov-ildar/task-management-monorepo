import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../../domain/entities/user/role/role';
import { PasswordTokenType } from '../../../application/auth/dtos/password-token-type';
import { TokenPair } from '../../../application/auth/dtos/token-pair';
import { TokenType } from '../../../application/auth/dtos/token-type';
import { IAuthenticationTokenProvider } from '../../../application/auth/services/i-auth-token.provider';
import { IPasswordTokenProvider } from '../../../application/auth/services/i-password-token.provider';
import { UUID } from 'node:crypto';
import { IEmailTokenProvider } from '../../../application/auth/services/i-email-token.provider';
import { EmailTokenType } from '../../../application/auth/dtos/email-token-type';

@Injectable()
export class JwtTokenProvider implements IAuthenticationTokenProvider, IPasswordTokenProvider, IEmailTokenProvider {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly passwordTokenSecret: string;
  private readonly emailTokenSecret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly passwordTokenTtl: number;
  private readonly emailTokenTtl: number;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessTokenSecret = configService.getOrThrow('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = configService.getOrThrow('REFRESH_TOKEN_SECRET');
    this.passwordTokenSecret = configService.getOrThrow('PASSWORD_TOKEN_SECRET');
    this.emailTokenSecret = configService.getOrThrow('EMAIL_TOKEN_SECRET');
    this.accessTtl = +configService.getOrThrow('ACCESS_TOKEN_TTL');
    this.refreshTtl = +configService.getOrThrow('REFRESH_TOKEN_TTL');
    this.passwordTokenTtl = +configService.getOrThrow('PASSWORD_TOKEN_TTL');
    this.emailTokenTtl = +configService.getOrThrow('EMAIL_TOKEN_TTL');
  }

  async signEmailToken(email: string): Promise<string> {
    return await this.jwtService.signAsync({ email }, { secret: this.emailTokenSecret, expiresIn: this.emailTokenTtl });
  }

  async verifyEmailToken(token: string): Promise<EmailTokenType> {
    return await this.jwtService.verifyAsync(token, { secret: this.emailTokenSecret });
  }

  async signTokenPair(userId: UUID, role: Role): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([this.signAccess(userId, role), this.signRefresh(userId, role)]);
    return new TokenPair(accessToken, refreshToken);
  }

  async verifyAccess(token: string): Promise<TokenType> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.accessTokenSecret,
    });
  }

  async verifyRefresh(token: string): Promise<TokenType> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.refreshTokenSecret,
    });
  }

  async signPasswordToken(payload: PasswordTokenType): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.passwordTokenSecret,
      expiresIn: this.passwordTokenTtl,
    });
  }
  async verifyPasswordToken(token: string): Promise<PasswordTokenType> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.passwordTokenSecret,
    });
  }

  private async signAccess(userId: UUID, role: Role) {
    return await this.jwtService.signAsync({ sub: userId, role }, { secret: this.accessTokenSecret, expiresIn: this.accessTtl });
  }

  private async signRefresh(userId: UUID, role: Role) {
    return await this.jwtService.signAsync({ sub: userId, role }, { secret: this.refreshTokenSecret, expiresIn: this.refreshTtl });
  }
}
