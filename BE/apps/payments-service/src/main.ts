import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaymentsServiceModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AllRpcExceptionsFilter } from '@app/common';

async function bootstrap() {
  const logger = new Logger('PaymentsService');

  try {
    const app = await NestFactory.create(PaymentsServiceModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      rawBody: true,
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
      .setTitle('Payments Service API')
      .setDescription(
        'API documentation for Payments Service with Stripe integration',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(
        `http://localhost:${configService.get<number>('PORT') || 3005}`,
        'Local Development',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const microservicePort = parseInt(
      process.env.MICROSERVICE_PORT || '3103',
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

    const port = configService.get<number>('PORT') || 3005;

    await app.listen(port);

    logger.log(
      `Payments Service (HTTP) is running on: http://localhost:${port}`,
    );
    logger.log(`Swagger UI: http://localhost:${port}/api`);
    logger.log(
      `Payments Service (Microservice) running on: TCP localhost:${microservicePort}`,
    );
  } catch (error) {
    logger.error('Failed to start Payments Service', error);
    process.exit(1);
  }
}

bootstrap();
