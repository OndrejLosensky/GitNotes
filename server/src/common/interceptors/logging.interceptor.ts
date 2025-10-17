import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url}`, LoggingInterceptor.name);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `← ${method} ${url} - ${duration}ms`,
            LoggingInterceptor.name,
          );
          // Log to access log file with more details
          this.logger.log(
            JSON.stringify({
              type: 'access',
              method,
              url,
              ip,
              userAgent,
              duration,
              status: 'success',
            }),
            'AccessLog',
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          // Only log to access log (detailed error logging handled by HttpExceptionFilter)
          this.logger.log(
            JSON.stringify({
              type: 'access',
              method,
              url,
              ip,
              userAgent,
              duration,
              status: 'error',
              error: errorMessage,
            }),
            'AccessLog',
          );
        },
      }),
    );
  }
}
