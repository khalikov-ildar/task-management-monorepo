import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { CustomError } from 'apps/api/src/domain/common/error/custom-error';
import { Result } from 'neverthrow';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ErrorMapper } from '../../../presentation/common/mappers/error-mapper';

@Injectable()
export class ResultMapperInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(this.mapError),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private mapError(result: Result<unknown, CustomError>) {
    return result.match(
      (payload) => payload,
      (e) => {
        const httpException = ErrorMapper.mapToNestHttpException(e);

        throw httpException;
      },
    );
  }
}
