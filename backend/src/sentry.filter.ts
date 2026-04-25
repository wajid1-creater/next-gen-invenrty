import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Sentry } from './sentry';

/**
 * Forwards 5xx-class errors to Sentry, then defers to Nest's default handling.
 *
 * 4xx errors (validation, auth, not-found) are *expected* and noisy — we don't
 * want to page on those. Only true server faults reach Sentry.
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      Sentry.captureException(exception);
    }

    // Re-throw so Nest's built-in error response stays in charge.
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<{
        status: (n: number) => { json: (b: unknown) => void };
      }>();
      res.status(status).json(exception.getResponse());
      return;
    }

    this.logger.error(
      `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{
      status: (n: number) => { json: (b: unknown) => void };
    }>();
    res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
}
