import { CustomError } from '../../../../domain/common/error/custom-error';
import { RefreshToken } from '../../../../domain/entities/tokens/refresh-token';
import { IRefreshTokenRepository } from '../../../../domain/repositories/tokens/i-refresh-token.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '@app/shared';
import { LogoutUserCommand } from './logout-user.command';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { RefreshTokenErrors } from '../../../../domain/errors/tokens/refresh-token.errors';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class LogoutUserUseCase implements IUseCase<LogoutUserCommand, void> {
  constructor(
    private readonly tokenRepository: IRefreshTokenRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(LogoutUserUseCase.name, this._genericLogger);

  async execute(request: LogoutUserCommand): Promise<Result<void, CustomError>> {
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;

    this.logger.logInfo('Attempt to logout', { userId });

    let existingToken: RefreshToken | null;
    try {
      existingToken = await this.tokenRepository.getByToken(request.token);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the token', {}, e);
      return err(UnexpectedError.create());
    }

    if (!existingToken) {
      this.logger.logInfo('Refresh token not found', { userId });
      return err(RefreshTokenErrors.NoTokenFound());
    }

    existingToken.revoke();

    try {
      await this.tokenRepository.updateToken(existingToken);
    } catch (e) {
      this.logger.logError('An error occurred while trying to update the token', {}, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully logget out', { userId });

    return ok(undefined);
  }
}
