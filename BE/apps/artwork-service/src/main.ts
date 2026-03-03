import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ArtworkServiceModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './presentation/http/filters';
import { LoggingInterceptor } from './presentation/http/interceptors';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('ArtworkService');

  const app = await NestFactory.create(ArtworkServiceModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

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
    .setTitle('Artwork Service API')
    .setDescription(
      'API documentation for Artwork Service with standardized error handling',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(
      `http://localhost:${process.env.PORT ?? 3003}`,
      'Local Development',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Connect microservice (TCP transport for communication with API Gateway)
  const microservicePort = parseInt(
    process.env.MICROSERVICE_PORT || '3102',
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

  const port = process.env.PORT ?? 3003;
  await app.listen(port);

  logger.log(`🚀 Artwork Service (HTTP) running on: http://localhost:${port}`);
  logger.log(`📝 Swagger UI: http://localhost:${port}/api`);
  logger.log(
    `🔌 Artwork Service (Microservice) running on: TCP localhost:${microservicePort}`,
  );
  logger.log(`🛡️ Global exception filter and validation enabled`);
}

bootstrap();
