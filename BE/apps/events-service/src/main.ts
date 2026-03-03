import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';
import { EventsRsvpServiceModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('EventsService');

  const microservicePort = parseInt(
    process.env.MICROSERVICE_PORT || '3109',
    10,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventsRsvpServiceModule,
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
    `Events Service (Microservice) running on: TCP localhost:${microservicePort}`,
  );
}

bootstrap();
