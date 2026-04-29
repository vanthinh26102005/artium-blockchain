# Coding Conventions

**Analysis Date:** 2026-04-21

---

## Naming Patterns

### Files (Backend — NestJS)
- **kebab-case** for all filenames, always
- Suffix encodes the layer type:
  - `login-email.dto.ts` — Data Transfer Object
  - `LoginByEmail.command.ts` — CQRS Command (PascalCase filename, `.command.ts` suffix)
  - `LoginByEmail.command.handler.ts` — Command Handler
  - `GetUserById.query.ts` — CQRS Query
  - `GetUserById.query.handler.ts` — Query Handler
  - `order.repository.ts` — Repository implementation
  - `order.repository.interface.ts` — Repository interface
  - `orders.entity.ts` — TypeORM entity
  - `rpc-exception.filter.ts` — NestJS filter
  - `app.module.ts` — NestJS module
- All barrel files named `index.ts`

### Files (Frontend — Next.js)
- **PascalCase** for React components: `BuyerCheckoutContactForm.tsx`, `AuthShell.tsx`
- **camelCase** for hooks, services, utilities: `useRegister.ts`, `useAuthStore.ts`, `apiClient.ts`
- **camelCase** for API modules: `usersApi.ts`, `orderApis.ts`
- **camelCase** for schema files: `auth.schema.ts`, `buyerCheckout.schema.ts`

### Classes & Types (Backend)
- **PascalCase** for all classes: `LoginByEmailCommand`, `GetUserByIdHandler`, `RpcExceptionHelper`
- **PascalCase** for interfaces with `I` prefix on domain interfaces: `IUserRepository`, `IOrderRepository`
- **PascalCase** for TypeORM entities: `User`, `Order`, `OrderItem`
- **PascalCase** for DTOs: `LoginEmailDto`, `CreateOrderDto`
- **SCREAMING_SNAKE_CASE** for enum values: `OrderStatus.PENDING`, `PayoutStatus.PENDING`

### Functions & Methods
- **camelCase** for all methods and functions: `findById()`, `findByEmail()`, `generateTokenPair()`
- Command handler method: always named `execute(command)` (enforced by `ICommandHandler`)
- Query handler method: always named `execute(query)` (enforced by `IQueryHandler`)

### Variables
- **camelCase** throughout: `orderNumber`, `collectorId`, `paymentIntentId`
- Database columns use snake_case in `@Column({ name: 'collector_id' })` decorator but are accessed via camelCase properties

---

## TypeScript Practices

### Backend (`BE/tsconfig.json`)
- `"strictNullChecks": true` — always check for null/undefined
- `"noImplicitAny": false` — `any` is permitted (also `@typescript-eslint/no-explicit-any: 'off'`)
- `"emitDecoratorMetadata": true` + `"experimentalDecorators": true` — required for NestJS DI
- `"target": "ES2023"`, `"module": "commonjs"`
- Non-null assertion (`!`) is common on required entity fields: `id!: string`, `status!: OrderStatus`
- Optional fields use `?: string | null` pattern explicitly

### Frontend (`FE/artium-web/tsconfig.json`)
- `"strict": true` — full strict mode
- `"moduleResolution": "bundler"`, `"module": "esnext"`
- Types inferred from Zod schemas via `z.infer<typeof schema>` — no manual type duplication
- `type` keyword for function return types (e.g., `type UseRegisterResult = { ... }`)
- `Pick<T, 'key'>` and similar utility types used in store definitions

### Utility Type Patterns (Frontend)
```typescript
// Derive types from Zod schemas
export type LoginFormValues = z.infer<typeof loginFormSchema>

// Narrow existing types
type PersistedAuthPayload = Pick<AuthPayload, 'accessToken' | 'user'>
```

---

## Import Organization

### Backend
- NestJS imports first, then third-party, then internal lib aliases, then local
- Path aliases for shared libraries: `@app/common`, `@app/auth`, `@app/rabbitmq`, `@app/outbox`, `@app/blockchain`
- Cross-service imports use full path: `import { IUserRepository } from 'apps/identity-service/src/domain'`

**Pattern observed in handlers:**
```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';          // shared lib alias
import { LoginByEmailCommand } from '../LoginByEmail.command'; // relative local
```

### Frontend
- Comments group imports by origin: `// react`, `// third-party`, `// @shared - apis`, `// @domains - auth`
- Path aliases: `@shared/*` maps to `src/@shared/*`; `@domains/*` maps to `src/@domains/*`
- Types imported with `import type { ... }` syntax when only used as types

**Pattern observed in hooks:**
```typescript
// react
import { useCallback, useState } from 'react'

// @shared - apis
import usersApi from '@shared/apis/usersApi'

// @shared - types
import type { LoginResponse } from '@shared/types/auth'
```

### Barrel Files
- Every directory with multiple exports has an `index.ts` barrel file
- Handlers collected in `handlers/index.ts`, then re-exported from parent `index.ts`
- Frontend domain components use `components/index.ts` barrels

---

## NestJS Conventions

### Module Structure (per service)
```
src/
├── domain/
│   ├── entities/          # TypeORM entities (extend AbstractEntity)
│   ├── interfaces/        # Repository interfaces (IRepository<T>)
│   └── index.ts
├── application/
│   ├── commands/
│   │   ├── *.command.ts   # Plain CQRS command classes
│   │   ├── handlers/      # @CommandHandler implementations
│   │   └── index.ts
│   ├── queries/
│   │   ├── *.query.ts     # Plain CQRS query classes
│   │   ├── handlers/      # @QueryHandler implementations
│   │   └── index.ts
│   └── event-handlers/    # @EventsHandler implementations
├── infrastructure/
│   └── repositories/      # TypeORM repository implementations
├── presentation/
│   ├── microservice/      # @MessagePattern controllers
│   └── http/              # REST/GraphQL controllers (where applicable)
├── app.module.ts
└── main.ts
```

### CQRS Pattern
Commands and queries are plain classes — no NestJS decorators on them:
```typescript
// BE/apps/orders-service/src/application/commands/CreateOrder.command.ts
export class CreateOrderCommand {
  constructor(public readonly data: CreateOrderDto) {}
}
```

Handlers implement the framework interface and use `@CommandHandler`/`@QueryHandler`:
```typescript
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  async execute(command: CreateOrderCommand): Promise<Order | null> { ... }
}
```

### Dependency Injection
Repositories are injected via string token (interface name):
```typescript
@Inject(IUserRepository) private readonly userRepository: IUserRepository
```

Registered in app.module.ts using:
```typescript
{ provide: IUserRepository, useClass: UserRepository }
```

### Microservice Controllers
Controllers use `@MessagePattern({ cmd: 'verb_noun' })` — snake_case command names:
```typescript
@MessagePattern({ cmd: 'create_order' })
async createOrder(@Payload() data: CreateOrderDto) {
  return this.commandBus.execute(new CreateOrderCommand(data));
}
```

### Logger Pattern
Every class that logs creates its own Logger instance:
```typescript
private readonly logger = new Logger(CreateOrderHandler.name);

this.logger.debug(`Creating order for buyer: ${data.buyerId}`);
this.logger.log(`Order created: ${order.id}`);
this.logger.warn(`Login failed: ${email}`);
this.logger.error(`Failed to create order`, error.stack);
```

### Entity Conventions
All entities extend `AbstractEntity` from `@app/common`:
```typescript
// BE/libs/common/src/entities/abstract.entity.ts
export abstract class AbstractEntity {
  @CreateDateColumn(...) createdAt!: Date;
  @UpdateDateColumn(...) updatedAt?: Date;
}
```

Column naming: TypeORM `name` parameter uses snake_case; TS property is camelCase:
```typescript
@Column({ name: 'collector_id', type: 'uuid', nullable: true })
collectorId?: string | null;
```

### DTOs
DTOs in `BE/libs/common/src/dtos/` are shared across services:
```typescript
export class LoginEmailDto {
  @ApiProperty({ ... })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
```

---

## Error Handling

### Backend Error Pattern
The `RpcExceptionHelper` static class (`BE/libs/common/src/exceptions/rpc-exceptions.ts`) is the canonical way to throw errors:

```typescript
// Available methods:
RpcExceptionHelper.badRequest('Email and password are required')
RpcExceptionHelper.unauthorized('Invalid credentials')
RpcExceptionHelper.forbidden('Access denied')
RpcExceptionHelper.notFound('Resource not found')
RpcExceptionHelper.conflict('Already exists')
RpcExceptionHelper.internalError(error.message)
RpcExceptionHelper.from(statusCode, message, errors?)  // generic
```

All handlers follow this try/catch pattern:
```typescript
async execute(command: MyCommand) {
  try {
    // ... business logic
  } catch (error) {
    this.logger.error(`Action failed`, error.stack);
    if (error instanceof RpcException) throw error;  // re-throw own exceptions
    if (error instanceof HttpException) throw RpcExceptionHelper.from(error.getStatus(), error.message);
    throw RpcExceptionHelper.internalError(error.message);
  }
}
```

Global exception filter `AllRpcExceptionsFilter` (`BE/libs/common/src/filters/rpc-exception.filter.ts`) catches unhandled exceptions and formats them into `{ statusCode, message, errors }`.

### Frontend Error Pattern
Hooks capture errors as strings, re-throw for caller handling:
```typescript
const initiate = useCallback(async (payload) => {
  try {
    await usersApi.registerInitiate(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.'
    setError(message)
    throw error  // re-throw for form-level handling
  }
}, [])
```

The API client (`@shared/services/apiClient`) extracts `message` from error response body using:
```typescript
const getErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && 'message' in data) { ... }
  return fallback
}
```

---

## Code Style (Formatting)

### Backend (`.prettierrc` at `BE/.prettierrc`)
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

### Frontend (`.prettierrc` at `FE/artium-web/`)
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
Note: Frontend has **no semicolons** (`"semi": false`).

### Linting (Backend `BE/eslint.config.mjs`)
- `typescript-eslint` with `recommendedTypeChecked` preset
- `eslint-plugin-prettier/recommended` for formatting
- Key overrides: `no-explicit-any: off`, `no-floating-promises: warn`, `no-unsafe-argument: warn`

### Linting (Frontend)
- `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

---

## Frontend-Specific Conventions

### Domain Architecture (`FE/artium-web/src/@domains/`)
Each domain contains:
```
@domains/{feature}/
├── components/   # Presentational React components (PascalCase.tsx)
├── hooks/        # Custom React hooks (useName.ts)
├── stores/       # Zustand stores (useNameStore.ts)
├── services/     # Pure service functions (camelCase.ts)
├── views/        # Page-level components (**Page.tsx)
├── validations/  # Zod schemas (***.schema.ts)
├── types/        # TypeScript types (camelCase.ts)
├── constants/    # Constants files (camelCase.ts)
└── utils/        # Utility functions (camelCase.ts)
```

### Hook Naming
- All hooks: `use` + PascalCase: `useRegister`, `useAuthStore`, `useApiInfiniteScroll`
- Zustand stores: `useNameStore` pattern (e.g., `useAuthStore`)
- Return type explicitly typed as `type UseName Result = { ... }`

### State Management
- **Zustand** for global/persistent state (auth, user session)
  - `BE/apps/identity-service` style: `create<State>((set, get) => ({ ... }))`
  - Manual `localStorage` persistence (not Zustand's `persist` middleware)
  - Hydration pattern: `hydrateAuth()` called client-side on mount
- **`useState`/`useCallback`** for local async operation state in hooks
- **React Hook Form** for all form state + validation

### Form Validation
- All forms use **Zod** schemas in `validations/*.schema.ts`
- `react-hook-form` + `@hookform/resolvers/zod` integration
- Schemas export both schema and inferred type:
  ```typescript
  export const loginFormSchema = z.object({ ... })
  export type LoginFormValues = z.infer<typeof loginFormSchema>
  ```

### Component Style (Tailwind)
- Utility classes directly in JSX — no CSS modules or styled-components
- `cn()` from `@shared/lib/utils` used for conditional class merging
- `prettier-plugin-tailwindcss` auto-sorts class names
- Design tokens as literal hex values: `text-[#191414]`, `border-[#E5E5E5]`, `text-[#0066FF]`
- Pixel-exact sizing: `h-[48px]`, `rounded-[12px]`, `text-[11px]`

### API Client Pattern
All HTTP calls go through `apiFetch`/`apiPost` from `@shared/services/apiClient`:
```typescript
const raw = await apiPost<Record<string, unknown>>('/identity/auth/login', input, { auth: false })
```
- `auth: true` (default) automatically attaches the Bearer token from `useAuthStore`
- APIs are collected in `@shared/apis/*.ts` files (one per service domain)

---

*Convention analysis: 2026-04-21*
