# API Gateway

The API Gateway serves as the single entry point for all client requests in the Artium microservices architecture. It handles:

- **Single port access** - Everything on `localhost:8081`
- **Unified API routing** - All routes under `/api` prefix
- **Service-specific routing** - `/api/identity`, `/api/artwork`, etc.
- **Centralized CORS** - CORS handled only at gateway level
- **Unified error handling** - All microservice errors are handled centrally
- **Request/Response logging** - Comprehensive logging with request IDs
- **Request validation** - Input validation for all incoming requests

## Architecture

The API Gateway uses **NestJS Microservices** with TCP transport to communicate with backend services. Each service runs both as:
1. **HTTP server** - For direct access if needed (with Swagger docs on individual ports)
2. **TCP microservice** - For communication with the API Gateway

```
Frontend & Clients (http://localhost:8081)
    ↓
API Gateway (Port 8081)
    ├── /api/identity/*     → Identity Service
    ├── /api/artwork/*      → Artwork Service
    ├── /api/payments/*     → Payments Service
    ├── /api/orders/*       → Orders Service
    ├── /api/messaging/*    → Messaging Service
    └── /api/notifications/* → Notifications Service
    ↓ TCP (Internal)
API Gateway (HTTP + CORS + Validation + Error Handling)
    ↓
Microservices (TCP)
    ├── Identity Service (TCP: 3101, HTTP: 3001)
    ├── Artwork Service (TCP: 3102)
    ├── Payments Service (TCP: 3103)
    ├── Orders Service (TCP: 3104)
    ├── Messaging Service (TCP: 3105)
    └── Notifications Service (TCP: 3106)
```

## Getting Started

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cd apps/api-gateway
cp .env.example .env
```

Edit `.env` to match your setup:
```env
PORT=3000
CORS_ORIGIN=http://localhost:8081

# Microservice connections
IDENTITY_SERVICE_HOST=localhost
IDENTITY_SERVICE_PORT=3101
# ... other services
```

### 2. Start Services

You need to start both the API Gateway and the microservices:

```bash
# Start the API Gateway
yarn dev:gateway

# In separate terminals, start the microservices
yarn dev:identity
yarn dev:artwork
yarn dev:payments
# ... etc
```

The microservices will run in hybrid mode (both HTTP and TCP).

### 3. Access the API

- **API Gateway**: http://localhost:8081
- **Main Swagger Documentation**: http://localhost:8081/api-docs (all services)
- **Service-Specific Swagger**:
  - Identity: http://localhost:8081/api/identity/docs
  - Artwork: http://localhost:8081/api/artwork/docs
  - Payments: http://localhost:8081/api/payments/docs
  - Orders: http://localhost:8081/api/orders/docs
  - Messaging: http://localhost:8081/api/messaging/docs
  - Notifications: http://localhost:8081/api/notifications/docs
- **API Base**: http://localhost:8081/api
- **CORS**: Enabled for all origins

## Features

### Centralized Error Handling

All errors from microservices are caught and formatted consistently by the `AllExceptionsFilter`:

```typescript
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/users/login",
  "method": "POST",
  "message": "Invalid credentials",
  "errors": null
}
```

### Request Logging

Every request is logged with a unique request ID:

```json
{
  "type": "REQUEST",
  "requestId": "uuid-here",
  "method": "POST",
  "url": "/users/login",
  "body": { "email": "***", "password": "***" }
}
```

### Input Validation

All requests are validated automatically using class-validator decorators. Sensitive fields (passwords, tokens) are sanitized in logs.

## Adding New Services

To add a new microservice to the gateway:

### 1. Add Service Configuration

Edit `src/config/microservices.config.ts`:

```typescript
export const MICROSERVICES = {
  // ... existing services
  NEW_SERVICE: 'NEW_SERVICE',
};

export const getMicroserviceConfig = (service: string) => {
  const configs = {
    // ... existing configs
    [MICROSERVICES.NEW_SERVICE]: {
      transport: Transport.TCP,
      options: {
        host: process.env.NEW_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.NEW_SERVICE_PORT || '3110', 10),
      },
    },
  };
  return configs[service];
};
```

### 2. Create Gateway Controller

Create `src/presentation/http/controllers/new-service.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../../config';

@ApiTags('NewService')
@Controller('new-service')
export class NewServiceController {
  constructor(
    @Inject(MICROSERVICES.NEW_SERVICE)
    private readonly newServiceClient: ClientProxy,
  ) {}

  @Get()
  async getData() {
    return firstValueFrom(
      this.newServiceClient.send({ cmd: 'get_data' }, {})
    );
  }
}
```

### 3. Register in App Module

Edit `src/app.module.ts`:

```typescript
import { NewServiceController } from './presentation/http/controllers/new-service.controller';

@Module({
  imports: [
    ClientsModule.register([
      // ... existing services
      {
        name: MICROSERVICES.NEW_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.NEW_SERVICE),
      },
    ]),
  ],
  controllers: [
    // ... existing controllers
    NewServiceController,
  ],
})
export class ApiGatewayModule {}
```

### 4. Update Microservice

In your microservice, add TCP transport support in `main.ts`:

```typescript
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(YourServiceModule);

  // Connect microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.MICROSERVICE_HOST || 'localhost',
      port: parseInt(process.env.MICROSERVICE_PORT || '3110', 10),
    },
  });

  await app.startAllMicroservices();
  await app.listen(3010); // HTTP port
}
```

Create a microservice controller to handle messages:

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class YourMicroserviceController {
  @MessagePattern({ cmd: 'get_data' })
  async getData(@Payload() data: any) {
    return { message: 'Hello from microservice' };
  }
}
```

## Security

- **CORS**: Configured to only allow requests from port 8081
- **Validation**: All inputs are validated before reaching microservices
- **Sensitive Data**: Passwords, tokens, and other sensitive data are sanitized in logs
- **Error Messages**: Error details are controlled to avoid leaking sensitive information

## Monitoring

The API Gateway logs all requests and responses with:
- Request ID for tracing
- Execution duration
- HTTP status codes
- Error details (sanitized)

## Development

### Build
```bash
yarn build:gateway
```

### Development Mode
```bash
yarn dev:gateway
```

## Notes

- The API Gateway does **NOT** handle business logic - it only routes requests
- Each microservice should handle its own validation and business rules
- The gateway provides a second layer of validation for security
- All HTTP concerns (CORS, error formatting, logging) are handled by the gateway
- Microservices communicate via TCP for better performance
