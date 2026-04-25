import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

/** Boots a fully-wired Nest app for e2e tests. Mirrors src/main.ts wiring. */
export async function buildTestApp() {
  // CRITICAL: force test-only env BEFORE AppModule's ConfigModule reads .env.
  // If we use `?? defaults`, the dev .env values (DB_NAME=next_gen_inventory)
  // win and tests will happily TRUNCATE production-grade dev data. Always wins.
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'next_gen_inventory_test';
  process.env.JWT_SECRET = 'test-jwt-secret-must-be-32-chars+';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-32-chars+';
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_MIGRATIONS_RUN = 'false';
  process.env.LOG_LEVEL = 'error';

  // Belt-and-braces: refuse to boot test app against any DB whose name doesn't
  // include "_test". Catches misconfigurations before they wipe data.
  if (!process.env.DB_NAME.includes('_test')) {
    throw new Error(
      `Refusing to boot test app against non-test DB: ${process.env.DB_NAME}`,
    );
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
}

/** Drops all data between tests so suites don't leak into each other. */
export async function truncateAllTables(app: INestApplication) {
  const ds = app.get(DataSource);

  // Final guard: only truncate if the active connection points at a *_test DB.
  const dbName = ds.options.database as string;
  if (!dbName?.includes('_test')) {
    throw new Error(`Refusing to TRUNCATE non-test DB: ${dbName}`);
  }

  const tables = [
    'audit_logs',
    'refresh_tokens',
    'bom_items',
    'forecasts',
    'notifications',
    'tasks',
    'deliveries',
    'purchase_orders',
    'products',
    'suppliers',
    'users',
  ];
  await ds.query(
    `TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
}
