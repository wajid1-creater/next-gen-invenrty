import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { buildLoggerOptions } from './logger.config';
import { validateEnv, type AppConfig } from './config/env.schema';
import { AuditModule } from './audit/audit.module';
import { ClsUserInterceptor } from './audit/cls-user.interceptor';
import { CsrfGuard } from './auth/guards/csrf.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { TasksModule } from './tasks/tasks.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { ForecastingModule } from './forecasting/forecasting.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Tests inject env via process.env directly and must NOT have backend/.env
      // (which points at the dev DB) override those values.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
    LoggerModule.forRoot(buildLoggerOptions()),
    // CLS = AsyncLocalStorage. Lets the audit subscriber pick up the current
    // request's userId without threading it through every service call.
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => [
        {
          ttl: config.get('THROTTLE_TTL_SECONDS', { infer: true }) * 1000,
          limit: config.get('THROTTLE_LIMIT', { infer: true }),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        host: config.get('DB_HOST', { infer: true }),
        port: config.get('DB_PORT', { infer: true }),
        username: config.get('DB_USERNAME', { infer: true }),
        password: config.get('DB_PASSWORD', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        autoLoadEntities: true,
        // synchronize is dangerous in prod — auto-alters the live schema.
        // Env schema rejects DB_SYNCHRONIZE=true when NODE_ENV=production.
        synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        migrationsRun: config.get('DB_MIGRATIONS_RUN', { infer: true }),
      }),
    }),
    AuthModule,
    UsersModule,
    SuppliersModule,
    ProductsModule,
    PurchaseOrdersModule,
    TasksModule,
    DeliveriesModule,
    ForecastingModule,
    DashboardModule,
    NotificationsModule,
    HealthModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_INTERCEPTOR, useClass: ClsUserInterceptor },
  ],
})
export class AppModule {}
