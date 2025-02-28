import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResultMapperInterceptor } from '../../infrastructure/common/inteceptors/result.mapper.interceptor';
import { AuthType } from '../../infrastructure/framework/decorators/auth-type.decorator';
import { AuthTypes } from '../../infrastructure/framework/enums/auth-types.enum';
import { RegisterUserRequest } from './dtos/register-user.request';
import { ICookieManager } from '../common/services/cookie-manager/i-cookie-manager';
import { AlsProvider } from '../../infrastructure/common/services/async-local-storage/als.provider';
import { RegisterUserUseCase } from '../../application/auth/use-cases/register/register-user.use-case';
import { LoginUserUseCase } from '../../application/auth/use-cases/login/login-user.use-case';
import { LogoutUserUseCase } from '../../application/auth/use-cases/logout/logout-user.use-case';
import { RefreshTokensUseCase } from '../../application/auth/use-cases/refresh/refresh-tokens.use-case';
import { ConfirmEmailUseCase } from '../../application/auth/use-cases/confirm-email/confirm-email.use-case';
import { SendEmailConfirmationUseCase } from '../../application/auth/use-cases/send-email-confirmation/send-email-confirmation.use-case';
import { PasswordResetRequestUseCase } from '../../application/auth/use-cases/password-reset-request/password-reset-request.use-case';
import { PasswordResetUseCase } from '../../application/auth/use-cases/password-reset/password-reset.use-case';
import { RegisterUserCommand } from '../../application/auth/use-cases/register/register-user.command';
import { LoginUserCommand } from '../../application/auth/use-cases/login/login-user.command';
import { LoginUserRequest } from './dtos/login-user.request';
import { TokenResponseDto } from './dtos/token.response';
import { Result } from 'neverthrow';
import { TokenPair } from '../../application/auth/dtos/token-pair';
import { CustomError } from '../../domain/common/error/custom-error';
import { REFRESH_TOKEN_COOKIE_KEY } from '../../infrastructure/framework/constants/auth.constants';
import { Response } from 'express';
import { ErrorMapper } from '../common/mappers/error-mapper';
import { LogoutUserCommand } from '../../application/auth/use-cases/logout/logout-user.command';
import { RefreshTokensCommand } from '../../application/auth/use-cases/refresh/refresh-tokens.command';
import { ConfirmEmailCommand } from '../../application/auth/use-cases/confirm-email/confirm-email.command';
import { UUID } from 'node:crypto';
import { SendEmailConfirmationCommand } from '../../application/auth/use-cases/send-email-confirmation/send-email-confirmation.command';
import { EmailConfirmationRequest } from './dtos/email-confirmation.request';
import { PasswordResetCommand } from '../../application/auth/use-cases/password-reset/password-reset.command';
import { ResetPasswordRequest } from './dtos/reset-password.request';
import { PasswordResetRequestCommand } from '../../application/auth/use-cases/password-reset-request/password-reset-request.command';
import { ResetPasswordRequestRequest } from './dtos/reset-password-request.request';

@ApiInternalServerErrorResponse()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly cookieManager: ICookieManager,
    private readonly alsProvider: AlsProvider,
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly logoutUser: LogoutUserUseCase,
    private readonly refreshTokens: RefreshTokensUseCase,
    private readonly confirm: ConfirmEmailUseCase,
    private readonly sendConfirmation: SendEmailConfirmationUseCase,
    private readonly requestPasswordReset: PasswordResetRequestUseCase,
    private readonly resetPassword: PasswordResetUseCase,
  ) {}

  @Post('register')
  @ApiConflictResponse()
  @ApiCreatedResponse()
  @UseInterceptors(ResultMapperInterceptor)
  @AuthType(AuthTypes.None)
  async register(@Body() request: RegisterUserRequest) {
    return await this.registerUser.execute(new RegisterUserCommand(request.email, request.password, request.username));
  }

  @Post('login')
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ type: TokenResponseDto })
  @HttpCode(HttpStatus.OK)
  @AuthType(AuthTypes.None)
  async login(@Res({ passthrough: true }) res: Response, @Body() request: LoginUserRequest) {
    const result = await this.loginUser.execute(new LoginUserCommand(request.email, request.password));

    return this.handleCookieSetting(result, res);
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @AuthType(AuthTypes.Cookie)
  async logout(@Res({ passthrough: true }) res: Response) {
    const token = this.alsProvider.getValue('refreshToken');

    const result = await this.logoutUser.execute(new LogoutUserCommand(token));

    return result.match(
      () => {
        this.cookieManager.deleteCookie(REFRESH_TOKEN_COOKIE_KEY, res);
      },
      (e) => {
        const exception = ErrorMapper.mapToNestHttpException(e);
        throw exception;
      },
    );
  }

  @Post('refresh')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ type: TokenResponseDto })
  @HttpCode(HttpStatus.OK)
  @AuthType(AuthTypes.Cookie)
  async refresh(@Res({ passthrough: true }) res: Response) {
    const token = this.alsProvider.getValue('refreshToken');
    const userId = this.alsProvider.getValue('userId');
    const role = this.alsProvider.getValue('role');

    const result = await this.refreshTokens.execute(new RefreshTokensCommand(token, userId, role));

    this.cookieManager.deleteCookie(REFRESH_TOKEN_COOKIE_KEY, res);

    return this.handleCookieSetting(result, res);
  }

  @Get('confirm-email')
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(ResultMapperInterceptor)
  @AuthType(AuthTypes.None)
  async confirmEmail(@Query('token') tokenId: UUID) {
    return await this.confirm.execute(new ConfirmEmailCommand(tokenId));
  }

  @Post('request-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(ResultMapperInterceptor)
  @AuthType(AuthTypes.None)
  async requestEmailConfirmation(@Body() request: EmailConfirmationRequest) {
    return await this.sendConfirmation.execute(new SendEmailConfirmationCommand(request.email));
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBadRequestResponse()
  @UseInterceptors(ResultMapperInterceptor)
  @AuthType(AuthTypes.None)
  async reset(@Body() request: ResetPasswordRequest, @Query('token') tokenId: UUID) {
    return await this.resetPassword.execute(new PasswordResetCommand(tokenId, request.password));
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(ResultMapperInterceptor)
  @AuthType(AuthTypes.None)
  async requestReset(@Body() request: ResetPasswordRequestRequest) {
    return await this.requestPasswordReset.execute(new PasswordResetRequestCommand(request.email));
  }

  private handleCookieSetting(result: Result<TokenPair, CustomError>, res: Response) {
    return result.match(
      (tokens) => {
        const nowInMilliseconds = Date.now();
        const monthInMilliseconds = 1000 * 60 * 60 * 24 * 30;
        const monthFromToday = new Date(nowInMilliseconds + monthInMilliseconds);

        this.cookieManager.setCookie(REFRESH_TOKEN_COOKIE_KEY, tokens.refreshToken, monthFromToday, res);

        return { token: tokens.accessToken };
      },
      (e) => {
        const exception = ErrorMapper.mapToNestHttpException(e);
        throw exception;
      },
    );
  }
}
