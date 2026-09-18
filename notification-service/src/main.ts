import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Global Validation Pipe (Validates DTOs & transforms data types)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 2. Enable CORS
  app.enableCors();

  // 3. Listen on Port 8002
  const port = process.env.PORT || 8002;
  await app.listen(port);
  logger.log(`🚀 Notification Microservice running on http://localhost:${port}`);
}
bootstrap();
