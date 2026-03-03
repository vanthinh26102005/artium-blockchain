import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MessagingModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('MessagingService');

  const app = await NestFactory.create(MessagingModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3004;
  const microservicePort = parseInt(
    configService.get<string>('MICROSERVICE_PORT') || '3105',
    10,
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for REST API
  app.setGlobalPrefix('api');

  // Serve static files for uploads
  const express = await import('express');
  app.use('/uploads', express.static('uploads'));

  // Connect microservice (TCP transport for communication with API Gateway)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('MICROSERVICE_HOST') || 'localhost',
      port: microservicePort,
    },
  });

  // Apply RPC exception filter for microservice communication
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.startAllMicroservices();

  await app.listen(port);

  logger.log(
    `🚀 Messaging Service (HTTP) running on: http://localhost:${port}`,
  );
  logger.log(
    `🔌 Messaging Service (Microservice) running on: TCP localhost:${microservicePort}`,
  );
  logger.log(`🛡️ Global exception filter and validation enabled`);
}
bootstrap();
