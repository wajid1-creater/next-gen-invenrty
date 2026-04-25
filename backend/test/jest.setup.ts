/**
 * Runs BEFORE any test file is imported (via jest-e2e.json `setupFiles`).
 *
 * We must set the env here, not inside beforeAll/beforeEach, because
 * AppModule's `@Module({ imports: [ConfigModule.forRoot({ validate }) ] })`
 * runs `validate` synchronously at module-class-load time — which happens
 * the moment a test file does `import { AppModule } from ...`.
 */
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5432';
// Use the same DB role as the dev .env so local runs work without extra setup.
// CI overrides via env vars (POSTGRES_USER=postgres, etc).
process.env.DB_USERNAME = process.env.DB_USERNAME ?? 'mac';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? '';
process.env.DB_NAME = 'next_gen_inventory_test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-32-chars+';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-32-chars+';
process.env.JWT_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.DB_SYNCHRONIZE = 'true';
process.env.DB_MIGRATIONS_RUN = 'false';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGINS = 'http://localhost:3000';
