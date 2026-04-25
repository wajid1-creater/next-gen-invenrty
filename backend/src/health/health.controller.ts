import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health endpoints for load balancers and orchestrators.
 *
 * - `/health` (liveness): the process is running. Cheap; no dependencies.
 * - `/health/ready` (readiness): the process can serve traffic — DB reachable,
 *   migrations applied, etc. Failing this should pull the pod out of rotation.
 *
 * These bypass the throttler (probes hit them frequently) and the JWT guard
 * (probes are anonymous).
 */
@ApiTags('health')
@SkipThrottle()
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1500 }),
    ]);
  }
}
