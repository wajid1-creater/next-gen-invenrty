import { z } from 'zod';

/**
 * Single source of truth for runtime configuration.
 *
 * Boot fails on any malformed or missing value (not just missing). This kills
 * the "JWT_EXPIRATION=foobar silently uses default" class of production bugs.
 *
 * Inject via `ConfigService<AppConfig, true>` to get full type inference.
 */

const durationRegex = /^\d+\s*[smhd]?$/;

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .optional(),

    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_USERNAME: z.string().min(1).default('postgres'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().min(1).default('next_gen_inventory'),
    DB_SYNCHRONIZE: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    DB_MIGRATIONS_RUN: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    DB_LOGGING: z
      .string()
      .optional()
      .transform((v) => v === 'true'),

    // Two distinct secrets — leaking the access secret must NOT compromise refresh.
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_EXPIRATION: z
      .string()
      .regex(
        durationRegex,
        'JWT_EXPIRATION must look like "15m" / "24h" / "7d"',
      )
      .default('15m'),
    JWT_REFRESH_EXPIRATION: z
      .string()
      .regex(durationRegex, 'JWT_REFRESH_EXPIRATION must look like "7d"')
      .default('7d'),

    CORS_ORIGINS: z.string().default('http://localhost:3000'),

    THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

    // Optional integrations — empty string disables them.
    SENTRY_DSN: z.string().optional().default(''),
  })
  .superRefine((env, ctx) => {
    if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must be different from JWT_SECRET',
      });
    }
    if (env.NODE_ENV === 'production' && env.DB_SYNCHRONIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DB_SYNCHRONIZE'],
        message:
          'DB_SYNCHRONIZE must NOT be true in production — use migrations instead',
      });
    }
  });

export type AppConfig = z.infer<typeof envSchema>;

/**
 * Used by ConfigModule.forRoot({ validate }).
 *
 * `raw` is the parsed contents of the .env file ONLY — when ignoreEnvFile is
 * true (tests), it's empty. We merge with process.env so values injected at
 * runtime (CI, test setup, container env) are validated alongside file values.
 */
export function validateEnv(raw: Record<string, unknown>): AppConfig {
  const merged = { ...process.env, ...raw };
  const result = envSchema.safeParse(merged);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return result.data;
}
