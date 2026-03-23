import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OrdersServiceModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('OrdersService');

  try {
    const app = await NestFactory.create(OrdersServiceModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Orders Service API')
      .setDescription(
        'API documentation for Orders Service with blockchain integration',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(
        `http://localhost:${configService.get<number>('PORT') || 3004}`,
        'Local Development',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const microservicePort = parseInt(
      process.env.MICROSERVICE_PORT || '3104',
      10,
    );
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        host: process.env.MICROSERVICE_HOST || 'localhost',
        port: microservicePort,
      },
    });

    app.useGlobalFilters(new AllRpcExceptionsFilter());

    await app.startAllMicroservices();

    const port = configService.get<number>('PORT') || 3004;

    await app.listen(port);

    logger.log(
      `Orders Service (HTTP) is running on: http://localhost:${port}`,
    );
    logger.log(`Swagger UI: http://localhost:${port}/api`);
    logger.log(
      `Orders Service (Microservice) running on: TCP localhost:${microservicePort}`,
    );
  } catch (error) {
    logger.error('Failed to start Orders Service', error);
    process.exit(1);
  }
}

bootstrap();
