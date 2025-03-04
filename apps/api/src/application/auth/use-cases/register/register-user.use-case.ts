import { CustomError } from '../../../../domain/common/error/custom-error';
import { User } from '../../../../domain/entities/user/user';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { UserRoles } from '../../../../domain/entities/user/user-roles';
import { IRoleRepository } from '../../../../domain/repositories/user/i-role.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { Result, err, ok } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '@app/shared';
import { maskEmail } from '../../../common/utils/mask-email';
import { SanitizedUser, sanitizeUser } from '../../../common/utils/sanitize-user';
import { IPasswordHasher } from '../../services/i-password.hasher';
import { RegisterUserCommand } from './register-user.command';
import { IEmailTokenProvider } from '../../services/i-email-token.provider';
import { IEventPublisher } from '../../../common/services/i-event-publisher';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { IEmailTokenRepository } from '../../../../domain/repositories/tokens/i-email-token.repository';
import { EmailVerificationToken } from '../../../../domain/entities/tokens/email-verification-token';
import { createEmailConfirmationEvent } from '@app/contracts';
import { UUID } from 'node:crypto';
import { Role } from '../../../../domain/entities/user/role/role';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class RegisterUserUseCase implements IUseCase<RegisterUserCommand, SanitizedUser> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly roleRepository: IRoleRepository,
    private readonly emailTokenProvider: IEmailTokenProvider,
    private readonly emailTokenRepository: IEmailTokenRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(RegisterUserUseCase.name, this._genericLogger);

  async execute(request: RegisterUserCommand): Promise<Result<SanitizedUser, CustomError>> {
    const maskedEmail = maskEmail(request.email);
    this.logger.logInfo('Attempt to register', { email: maskedEmail });

    const userFetchingResult = await this.handleUserFetching(request.email, maskedEmail);
    if (userFetchingResult.isErr()) {
      return err(userFetchingResult.error);
    }

    const hashingPasswordAndFetchingRoleResult = await this.handleHashingPasswordAndFetchingRole(request.password);
    if (hashingPasswordAndFetchingRoleResult.isErr()) {
      return err(hashingPasswordAndFetchingRoleResult.error);
    }
    const [hashedPassword, role] = hashingPasswordAndFetchingRoleResult.value;

    const user = new User(request.email, hashedPassword, request.username, role);

    try {
      await this.userRepository.save(user);
    } catch (e) {
      this.logger.logError('An error occurred while trying to save user', {}, e);
      return err(UnexpectedError.create());
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Started transaction for email token generation', {});

        try {
          await this.handleEventTokenGeneration(user.email, user.id, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying to generate and save the email token', {}, e);
          throw e;
        }

        this.logger.logInfo('Successfully finished transaction', {});
      });
    } catch (e) {}

    this.logger.logInfo('Successfully registered user', { email: maskedEmail });

    return ok(sanitizeUser(user));
  }

  private async handleUserFetching(email: string, maskedEmail: string): Promise<Result<void, CustomError>> {
    let existingUser: User | null;

    try {
      existingUser = await this.userRepository.getByEmail(email);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the user', {}, e);
      return err(UnexpectedError.create());
    }

    if (existingUser) {
      this.logger.logInfo('Attempt to register failed due to existance of user with email', { email: maskedEmail });
      return err(UserErrors.UserAlreadyExists());
    }
  }

  private async handleHashingPasswordAndFetchingRole(password: string): Promise<Result<[string, Role], CustomError>> {
    const hashPassword = this.passwordHasher.hash(password);
    const getRoleId = this.roleRepository.getByName(UserRoles.Member);

    let hashedPassword: string;
    let role: Role | null;

    try {
      [hashedPassword, role] = await Promise.all([hashPassword, getRoleId]);
    } catch (e) {
      this.logger.logError('An error occurred while trying to hash password or fetch role', {}, e);
      return err(UnexpectedError.create());
    }

    if (!role) {
      this.logger.logError('User role does not exist', {});
      return err(UnexpectedError.create());
    }

    return ok([hashedPassword, role]);
  }

  private async handleEventTokenGeneration(email: string, id: UUID, tx?: any) {
    const emailToken = await this.emailTokenProvider.signEmailToken(email);
    const emailEntity = new EmailVerificationToken(id, email, emailToken);

    await this.emailTokenRepository.save(emailEntity, tx);

    await this.eventPublisher.publish(createEmailConfirmationEvent(id, email, emailEntity.id));
  }
}
