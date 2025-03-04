import { CustomError } from '../../../../domain/common/error/custom-error';
import { RefreshToken } from '../../../../domain/entities/tokens/refresh-token';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { IRefreshTokenRepository } from '../../../../domain/repositories/tokens/i-refresh-token.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { Result, err, ok } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { maskEmail } from '../../../common/utils/mask-email';
import { TokenPair } from '../../dtos/token-pair';
import { IAuthenticationTokenProvider } from '../../services/i-auth-token.provider';
import { IPasswordHasher } from '../../services/i-password.hasher';
import { LoginUserCommand } from './login-user.command';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class LoginUserUseCase implements IUseCase<LoginUserCommand, TokenPair> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly transactionManager: ITransactionManager,
    private readonly tokenProvider: IAuthenticationTokenProvider,
    private readonly tokenRepository: IRefreshTokenRepository,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(LoginUserUseCase.name, this._genericLogger);

  async execute(request: LoginUserCommand): Promise<Result<TokenPair, CustomError>> {
    const maskedEmail = maskEmail(request.email);

    this.logger.logInfo('Attempt to login', { email: maskedEmail });

    const existingUser = await this.userRepository.getByEmail(request.email);

    if (!existingUser) {
      this.logger.logInfo('Login attempt failed for email', { email: maskedEmail });
      return err(UserErrors.InvalidCredentials());
    }

    const passwordMatches = await this.passwordHasher.verify(existingUser.password, request.password);

    if (!passwordMatches) {
      this.logger.logInfo('Login attempt failed for email', { email: maskedEmail });
      return err(UserErrors.InvalidCredentials());
    }

    let tokenPair: TokenPair;

    try {
      tokenPair = await this.transactionManager.execute(async (tx) => {
        let tokenPair: TokenPair;
        this.logger.logInfo('Starting transaction for token creation', {});

        try {
          tokenPair = await this.tokenProvider.signTokenPair(existingUser.id, existingUser.role);
        } catch (e) {
          this.logger.logError('An error occurred while trying to sign token pair', {}, e);
          throw e;
        }

        const refreshToken = new RefreshToken(existingUser.id, tokenPair.refreshToken);

        try {
          await this.tokenRepository.save(refreshToken, tx);
        } catch (e) {
          this.logger.logError('An error occurred while saving the tokens', {}, e);
          throw e;
        }

        this.logger.logInfo('Transaction completed successfully', {});

        return tokenPair;
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully logged in', { email: maskedEmail });

    return ok(tokenPair);
  }
}
