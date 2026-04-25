import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Env is validated by ConfigModule's `validate` hook on first DI resolution
  // (see src/config/env.schema.ts). Boot will throw before reaching listen().

  const app = await NestFactory.create(AppModule, {
    // Buffer logs until Pino takes over so early framework messages aren't lost.
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  const logger = app.get(PinoLogger);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // credentials:true is required for the browser to send our auth cookies
  // cross-origin (frontend on :3000, backend on :4000).
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NGIM API')
    .setDescription('Next-Gen Inventory Management API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
  logger.log(`API docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  // No Nest container yet — fall back to bare console for the boot failure.

  console.error('Failed to bootstrap:', err);
  process.exit(1);
});
