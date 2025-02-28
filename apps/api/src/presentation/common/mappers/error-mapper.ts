import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomError, ErrorTypes } from '../../../domain/common/error/custom-error';

export class ErrorMapper {
  static mapToNestHttpException(error: CustomError, customMessage?: string): HttpException {
    switch (error.code) {
      case ErrorTypes.Validation: {
        return new BadRequestException(customMessage ?? error.message);
      }
      case ErrorTypes.Unauthorized: {
        return new UnauthorizedException(customMessage ?? error.message);
      }
      case ErrorTypes.Forbidden: {
        return new ForbiddenException(customMessage ?? error.message);
      }
      case ErrorTypes.NotFound: {
        return new NotFoundException(customMessage ?? error.message);
      }
      case ErrorTypes.Conflict: {
        return new ConflictException(customMessage ?? error.message);
      }
      case ErrorTypes.Internal: {
        return new InternalServerErrorException(customMessage ?? error.message);
      }
    }
  }
}
