import { ILogger } from '@app/shared';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, finalize } from 'rxjs';

@Injectable()
export class RequestLatencyLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: ILogger) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const onRequest = performance.now();

    return next.handle().pipe(
      finalize(() => {
        const onResponse = performance.now();
        this.logger.logInfo('Request handled', { latency: onResponse - onRequest });
      }),
    );
  }
}
