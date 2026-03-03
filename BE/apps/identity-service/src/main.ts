import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IdentityServiceModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('IdentityService');

  const app = await NestFactory.create(IdentityServiceModule);

  // app.enableCors({
  //   origin: true,
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  // });

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

  const config = new DocumentBuilder()
    .setTitle('Identity Service API')
    .setDescription(
      'API documentation for Identity Service with standardized error handling',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(
      `http://localhost:${process.env.PORT ?? 3001}`,
      'Local Development',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Connect microservice (TCP transport for communication with API Gateway)
  const microservicePort = parseInt(
    process.env.MICROSERVICE_PORT || '3101',
    10,
  );
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.MICROSERVICE_HOST || 'localhost',
      port: microservicePort,
    },
  });

  // Apply RPC exception filter for microservice communication
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`Identity Service (HTTP) running on: http://localhost:${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api`);
  logger.log(
    `Identity Service (Microservice) running on: TCP localhost:${microservicePort}`,
  );
  logger.log(`Global exception filter and validation enabled`);
}

bootstrap();
