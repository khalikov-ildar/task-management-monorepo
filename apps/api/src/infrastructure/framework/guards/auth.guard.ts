import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth_Type_Metadata } from '../decorators/auth-type.decorator';
import { AuthTypes } from '../enums/auth-types.enum';
import { AccessTokenGuard } from './access-token.guard';
import { RefreshTokenGuard } from './refresh-token.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly defaultAuthType = AuthTypes.Bearer;

  private readonly authStrategies: Record<AuthTypes, CanActivate> = {
    [AuthTypes.None]: { canActivate: () => true },
    [AuthTypes.Bearer]: this.accessTokenGuard,
    [AuthTypes.Cookie]: this.refreshTokenGuard,
  };

  constructor(
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly refreshTokenGuard: RefreshTokenGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.getAuthTypes(context);
    const guards = this.getGuardsFromAuthTypes(authTypes);

    return await this.tryActivateGuards(guards, context);
  }

  private getAuthTypes(context: ExecutionContext): AuthTypes[] {
    return (
      this.reflector.getAllAndOverride<AuthTypes[]>(Auth_Type_Metadata, [context.getHandler(), context.getClass()]) ?? [
        AuthGuard.defaultAuthType,
      ]
    );
  }

  private getGuardsFromAuthTypes(authTypes: AuthTypes[]): CanActivate[] {
    return authTypes.map((type) => {
      const guard = this.authStrategies[type];
      if (!guard) {
        throw new Error(`Unknown auth type: ${type}`);
      }
      return guard;
    });
  }

  private async tryActivateGuards(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let lastError: Error = new UnauthorizedException('Authentication failed');

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (canActivate) {
          return true;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new UnauthorizedException(error);
      }
    }

    throw lastError;
  }
}
