# System Architecture: DDD + Clean Architecture + CQRS + Event-Driven

Most of the applications in this monorepo are built using a combination of **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS (Command Query Responsibility Segregation)**, and an **Event-Driven Architecture**.

This architecture is organized into four main layers:

---

## 1. Domain Layer (`src/domain/`)

This is the core layer containing the central business logic:

- **DTOs (`dtos/`)**: Data Transfer Objects for the domain.
- **Entities (`entities/`)**: Business entities.
- **Enums (`enums/`)**: Enumerations for statuses, types, etc.
- **Events (`events/`)**: Domain events such as `UserRegisteredEvent`.
- **Exceptions (`exceptions/`)**: Custom business exceptions.
- **Services (`services/`)**: Domain services that encapsulate business logic.

---

## 2. Application Layer (`src/application/`)

This layer orchestrates the use cases and application logic:

- **Commands (`commands/`)**: Handle data modification operations (Create, Update, Delete).
  - Structure: `{Entity}{Action}.command.ts`
  - Corresponding Handler: `handlers/{Entity}{Action}.command.handler.ts`

- **Queries (`queries/`)**: Handle data retrieval operations.
  - Similar structure to commands, but for querying data.

- **Event Handlers (`event-handlers/`)**: Handle domain events.
  - Automatically handle side effects when events are dispatched.

---

## 3. Infrastructure Layer (`src/infrastructure/`)

This layer provides concrete implementations of interfaces defined in the domain layer:

- **Repositories (`repositories/`)**: Implementation of the repository pattern.
- **Services (`services/`)**: Infrastructure services such as caching, external APIs, etc.

---

## 4. Presentation Layer (`src/presentation/`)

This is the entry point to the application:

- **Controllers (`http/controllers/`)**: REST API endpoints.
  - Should not contain business logic, but delegate to commands and queries.

- **GraphQL (`.../graphql/`)**: GraphQL endpoints (resolvers).
  - Should not contain business logic, but delegate to commands and queries.

- **DTOs (`http/dtos/`)**: DTOs for HTTP requests and responses.

---

## Key Architectural Characteristics

### CQRS Pattern
- Clear separation between **Commands (writes)** and **Queries (reads)**.
- Commands can dispatch events, while Queries only read data.
- Each use case has its own dedicated handler.

### Event-Driven Architecture
- Command handlers dispatch events after successful execution.
- Event handlers automatically handle side effects.
- Reduces coupling between modules and increases extensibility.

### Dependency Inversion
- The **Domain** layer has no dependencies on other layers.
- **Presentation** depends on **Application**.
- **Application** depends on **Domain**.
- **Infrastructure** implements interfaces from **Domain**.