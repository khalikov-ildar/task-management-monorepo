import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user.module';
import { registerImplementation } from '../utils/register-implementation';
import { IPasswordHasher } from '../../../application/auth/services/i-password.hasher';
import { BcryptHasher } from '../../services/auth/bcrypt.hasher';
import { IAuthenticationTokenProvider } from '../../../application/auth/services/i-auth-token.provider';
import { JwtTokenProvider } from '../../services/auth/jwt.provider';
import { IPasswordTokenProvider } from '../../../application/auth/services/i-password-token.provider';
import { IRefreshTokenRepository } from '../../../domain/repositories/tokens/i-refresh-token.repository';
import { RefreshTokenRepository } from '../../persistence/tokens/refresh-token.repository';
import { IPasswordTokenRepository } from '../../../domain/repositories/tokens/i-password-token.repository';
import { PasswordTokenRepository } from '../../persistence/tokens/password-reset-token.repository';
import { registerAuthUseCases } from '../di/auth-use-cases.registration';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../guards/auth.guard';
import { ICookieManager } from '../../../presentation/common/services/cookie-manager/i-cookie-manager';
import { CookieManager } from '../../../presentation/common/services/cookie-manager/cookie-manager';
import { IEmailTokenProvider } from 'apps/api/src/application/auth/services/i-email-token.provider';
import { IEmailTokenRepository } from 'apps/api/src/domain/repositories/tokens/i-email-token.repository';
import { EmailTokenRepository } from '../../persistence/tokens/email-token.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.getOrThrow('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: config.getOrThrow('ACCESS_TOKEN_TTL') },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [
    registerImplementation(IPasswordHasher, BcryptHasher),
    registerImplementation(IAuthenticationTokenProvider, JwtTokenProvider),
    registerImplementation(IPasswordTokenProvider, JwtTokenProvider),
    registerImplementation(IEmailTokenProvider, JwtTokenProvider),
    registerImplementation(IRefreshTokenRepository, RefreshTokenRepository),
    registerImplementation(IPasswordTokenRepository, PasswordTokenRepository),
    registerImplementation(IEmailTokenRepository, EmailTokenRepository),
    registerImplementation(ICookieManager, CookieManager),
    ...registerAuthUseCases(),
    AccessTokenGuard,
    RefreshTokenGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [IPasswordHasher],
})
export class AuthModule {}
