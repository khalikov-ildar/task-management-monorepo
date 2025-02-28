import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenType } from 'apps/api/src/application/auth/dtos/token-type';
import { IAuthenticationTokenProvider } from 'apps/api/src/application/auth/services/i-auth-token.provider';
import { ILogger } from 'apps/api/src/application/common/services/i-logger';
import { ICookieManager } from 'apps/api/src/presentation/common/services/cookie-manager/i-cookie-manager';
import { AlsProvider } from '../../common/services/async-local-storage/als.provider';
import { REFRESH_TOKEN_COOKIE_KEY } from '../constants/auth.constants';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly alsProvider: AlsProvider,
    private readonly tokenProvider: IAuthenticationTokenProvider,
    private readonly cookieManager: ICookieManager,
    private readonly logger: ILogger,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const context = RefreshTokenGuard.name;
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = this.cookieManager.getCookie(REFRESH_TOKEN_COOKIE_KEY, request);

    if (!token) {
      this.logger.logInfo('No refresh token provided', { context });
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await this.tokenProvider.verifyRefresh(token);

      if (!this.isValidPayload(tokenPayload)) {
        this.logger.logError('Refresh token payload is invalid', { context });
        throw new UnauthorizedException('Invalid token payload');
      }

      this.populateAls(tokenPayload, token);

      return true;
    } catch (e) {
      this.logger.logInfo('Provided refresh token is invalid or expired', { context });
      throw new UnauthorizedException('Provided token is invalid or expired');
    }
  }

  private isValidPayload(payload: TokenType): boolean {
    return Boolean(payload?.sub && payload?.role);
  }

  private populateAls(payload: TokenType, rawToken: string): void {
    this.alsProvider.setValue('userId', payload.sub).setValue('role', payload.role).setValue('refreshToken', rawToken);
  }
}
