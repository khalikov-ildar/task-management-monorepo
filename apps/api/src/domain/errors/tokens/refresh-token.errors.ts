import { CustomError } from '../../common/error/custom-error';

export class RefreshTokenErrors {
  public static NoTokenFound(): CustomError {
    return new CustomError('Internal', 'Something went wrong during token retrieval');
  }

  public static TokenIsInvalid(): CustomError {
    return new CustomError('Unauthorized', 'Provided token is invalid');
  }

  public static TokenReuseDetected(): CustomError {
    return new CustomError('Unauthorized', 'Token reuse detected. All active tokens got revoked');
  }
}
