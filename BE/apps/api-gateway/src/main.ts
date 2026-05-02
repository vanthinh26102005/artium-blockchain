import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ApiGatewayModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './presentation/http/filters';
import {
  LoggingInterceptor,
  RpcExceptionInterceptor,
} from './presentation/http/interceptors';

const normalizeGlobalPrefix = (prefix?: string): string => {
  const normalized = prefix?.trim().replace(/^\/+|\/+$/g, '') ?? '';

  if (!normalized || normalized === 'false' || normalized === 'none') {
    return '';
  }

  return normalized;
};

const resolveApiGlobalPrefix = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return '';
  }

  if (process.env.API_GLOBAL_PREFIX !== undefined) {
    return normalizeGlobalPrefix(process.env.API_GLOBAL_PREFIX);
  }

  return 'api';
};

async function bootstrap() {
  const logger = new Logger('ApiGateway');

  const app = await NestFactory.create(ApiGatewayModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    rawBody: true,
  });

  const apiGlobalPrefix = resolveApiGlobalPrefix();
  const routeBasePath = apiGlobalPrefix ? `/${apiGlobalPrefix}` : '';
  const serviceRoute = (serviceName: string) => `${routeBasePath}/${serviceName}`;

  if (apiGlobalPrefix) {
    app.setGlobalPrefix(apiGlobalPrefix);
  }

  logger.log(
    apiGlobalPrefix
      ? `API global prefix enabled: /${apiGlobalPrefix}`
      : 'API global prefix disabled',
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new RpcExceptionInterceptor(),
  );

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

  const mainConfig = new DocumentBuilder()
    .setTitle('Artium API Gateway')
    .setDescription(
      'Centralized API Gateway for Artium microservices\n\n' +
        '## Available Services\n' +
        `- **Identity Service**: \`${serviceRoute('identity')}/*\` - [View Docs](/api-docs/identity)\n` +
        `- **Artwork Service**: \`${serviceRoute('artwork')}/*\` - [View Docs](/api-docs/artwork)\n` +
        `- **Payments Service**: \`${serviceRoute('payments')}/*\` - [View Docs](/api-docs/payments)\n` +
        `- **Orders Service**: \`${serviceRoute('orders')}/*\` - [View Docs](/api-docs/orders)\n` +
        `- **Messaging Service**: \`${serviceRoute('messaging')}/*\` - [View Docs](/api-docs/messaging)\n` +
        `- **Notifications Service**: \`${serviceRoute('notifications')}/*\` - [View Docs](/api-docs/notifications)`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(
      `http://localhost:${process.env.PORT || 8081}`,
      'Local Development',
    )
    .addTag('Identity', 'Identity Service - User authentication and management')
    .addTag('Artwork', 'Artwork Service - Artwork management')
    .addTag('Payments', 'Payments Service - Payment processing')
    .addTag('Orders', 'Orders Service - Order management')
    .addTag('Messaging', 'Messaging Service - Real-time messaging')
    .addTag('Notifications', 'Notifications Service - Notification management')
    .build();

  const mainDocument = SwaggerModule.createDocument(app, mainConfig);

  SwaggerModule.setup('api-docs', app, mainDocument);

  const createServiceSwagger = (
    serviceName: string,
    title: string,
    description: string,
    tag: string,
    path: string,
  ) => {
    const serviceConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(
        `http://localhost:${process.env.PORT || 8081}`,
        'Local Development',
      )
      .addTag(tag)
      .build();

    const serviceDocument = SwaggerModule.createDocument(app, serviceConfig, {
      include: [],
      deepScanRoutes: true,
    });

    serviceDocument.paths = Object.fromEntries(
      Object.entries(serviceDocument.paths).filter(([path]) =>
        path.startsWith(serviceRoute(serviceName)),
      ),
    );

    SwaggerModule.setup(path, app, serviceDocument, {
      customSiteTitle: title,
    });
  };

  createServiceSwagger(
    'identity',
    'Identity Service API',
    'User authentication, registration, and profile management',
    'Identity',
    'api-docs/identity',
  );
  createServiceSwagger(
    'artwork',
    'Artwork Service API',
    'Artwork management, folders, tags, and image uploads',
    'Artwork',
    'api-docs/artwork',
  );
  createServiceSwagger(
    'payments',
    'Payments Service API',
    'Payment processing, Stripe integration, and transactions',
    'Payments',
    'api-docs/payments',
  );
  createServiceSwagger(
    'orders',
    'Orders Service API',
    'Order management and tracking',
    'Orders',
    'api-docs/orders',
  );
  createServiceSwagger(
    'messaging',
    'Messaging Service API',
    'Real-time messaging and conversations',
    'Messaging',
    'api-docs/messaging',
  );
  createServiceSwagger(
    'notifications',
    'Notifications Service API',
    'Notification management and delivery',
    'Notifications',
    'api-docs/notifications',
  );

  const port = process.env.PORT || 8081;
  await app.listen(port);

  logger.log(`API Gateway running on: http://localhost:${port}`);
  logger.log(`Main Swagger UI: http://localhost:${port}/api-docs`);
  logger.log(`API Base URL: http://localhost:${port}/api`);
  logger.log(`\nService-Specific Documentation:`);
  logger.log(`   - Identity:      http://localhost:${port}/api-docs/identity`);
  logger.log(`   - Artwork:       http://localhost:${port}/api-docs/artwork`);
  logger.log(`   - Payments:      http://localhost:${port}/api-docs/payments`);
  logger.log(`   - Orders:        http://localhost:${port}/api-docs/orders`);
  logger.log(`   - Messaging:     http://localhost:${port}/api-docs/messaging`);
  logger.log(
    `   - Notifications: http://localhost:${port}/api-docs/notifications`,
  );
  logger.log(`\nCORS enabled for all origins`);
  logger.log(`Global exception filter and validation enabled`);
}

bootstrap();
