import type { Params as PinoParams } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

/**
 * Centralised Pino config. Pretty output in dev/test, structured JSON in prod.
 * Aggressively redacts known-sensitive fields so secrets never reach log
 * aggregators (Datadog, Loki, CloudWatch, etc).
 */
export function buildLoggerOptions(): PinoParams {
  const isProd = process.env.NODE_ENV === 'production';
  const level = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

  return {
    pinoHttp: {
      level,
      // Pretty in dev only — pino-pretty is a perf overhead and breaks JSON parsing.
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:HH:MM:ss.l',
              ignore: 'pid,hostname,req,res,responseTime',
              messageFormat: '{context} | {msg}',
            },
          },
      // Correlation ID: honour upstream x-request-id, otherwise mint one.
      genReqId: (req: IncomingMessage) => {
        const incoming = (req.headers['x-request-id'] ??
          req.headers['x-correlation-id']) as string | undefined;
        return incoming?.trim() || randomUUID();
      },
      customProps: (req) => ({
        reqId: (req as IncomingMessage & { id?: string }).id,
      }),
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? '';
          // Health-check spam pollutes logs without telling us anything.
          return url.startsWith('/api/health');
        },
      },
      // Hide auth credentials, cookies, and JWT secrets from every log line.
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["set-cookie"]',
          'res.headers["set-cookie"]',
          'req.body.password',
          'req.body.token',
          'req.body.refreshToken',
          '*.password',
          '*.token',
          '*.refreshToken',
          '*.JWT_SECRET',
          '*.JWT_REFRESH_SECRET',
          '*.DB_PASSWORD',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req: IncomingMessage & { id?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
      },
    },
  };
}
