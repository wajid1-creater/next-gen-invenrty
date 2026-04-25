import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { CLS_USER_ID_KEY } from './audit.subscriber';

interface AuthenticatedReq {
  user?: { id?: string };
}

/**
 * Stashes the authenticated user id into CLS so the audit subscriber can
 * attribute writes without threading the user through every service call.
 *
 * Runs as a global interceptor — guards have already populated req.user by
 * the time interceptors fire (middleware runs too early for that).
 */
@Injectable()
export class ClsUserInterceptor implements NestInterceptor {
  constructor(private cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<AuthenticatedReq>();
      if (req.user?.id) {
        this.cls.set(CLS_USER_ID_KEY, req.user.id);
      }
    }
    return next.handle();
  }
}
