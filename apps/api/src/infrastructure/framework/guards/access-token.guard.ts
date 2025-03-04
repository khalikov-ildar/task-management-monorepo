import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenType } from '../../../application/auth/dtos/token-type';
import { IAuthenticationTokenProvider } from '../../../application/auth/services/i-auth-token.provider';
import { ILogger } from '@app/shared';
import { AlsProvider } from '../../common/services/async-local-storage/als.provider';
import { Request } from 'express';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly alsProvider: AlsProvider,
    private readonly tokenProvider: IAuthenticationTokenProvider,
    private readonly logger: ILogger,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const context = AccessTokenGuard.name;
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.logInfo('No access token provided', { context });
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await this.tokenProvider.verifyAccess(token);

      if (!this.isValidPayload(tokenPayload)) {
        this.logger.logError('Access token payload is invalid', { context });
        throw new Error();
      }

      this.populateAls(tokenPayload);

      return true;
    } catch (e) {
      this.logger.logInfo('Provided access token is invalid or expired', { context });
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    if (req.headers.authorization) {
      const [scheme, token] = req.headers.authorization.split(' ');
      if (scheme.toLowerCase() === 'bearer') {
        return token;
      }
    }
    return undefined;
  }

  private isValidPayload(payload: TokenType): boolean {
    return Boolean(payload?.sub && payload?.role);
  }

  private populateAls(payload: TokenType): void {
    this.alsProvider.setValue('userId', payload.sub).setValue('role', payload.role);
  }
}
