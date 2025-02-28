import { CustomError } from '../../../../domain/common/error/custom-error';
import { RefreshToken } from '../../../../domain/entities/tokens/refresh-token';
import { IRefreshTokenRepository } from '../../../../domain/repositories/tokens/i-refresh-token.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '../../../common/services/i-logger';
import { LogoutUserCommand } from './logout-user.command';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { RefreshTokenErrors } from 'apps/api/src/domain/errors/tokens/refresh-token.errors';

export class LogoutUserUseCase implements IUseCase<LogoutUserCommand, void> {
  constructor(
    private readonly tokenRepository: IRefreshTokenRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly logger: ILogger,
  ) {}

  async execute(request: LogoutUserCommand): Promise<Result<void, CustomError>> {
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;
    const context = LogoutUserUseCase.name;

    this.logger.logInfo('Attempt to logout', { context, userId });

    let existingToken: RefreshToken | null;
    try {
      existingToken = await this.tokenRepository.getByToken(request.token);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the token', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!existingToken) {
      this.logger.logInfo('Refresh token not found', { context, userId });
      return err(RefreshTokenErrors.NoTokenFound());
    }

    existingToken.revoke();

    try {
      await this.tokenRepository.updateToken(existingToken);
    } catch (e) {
      this.logger.logError('An error occurred while trying to update the token', { context }, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully logget out', { context, userId });

    return ok(undefined);
  }
}
