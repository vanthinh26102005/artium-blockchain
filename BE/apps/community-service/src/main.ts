import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CommunityServiceModule } from './app.module';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('CommunityService');

  const microservicePort = parseInt(
    process.env.MICROSERVICE_PORT || '3106',
    10,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunityServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.MICROSERVICE_HOST || 'localhost',
        port: microservicePort,
      },
    },
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

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

  await app.listen();

  logger.log(
    `Community Service (Microservice) running on: TCP localhost:${microservicePort}`,
  );
}

bootstrap();
