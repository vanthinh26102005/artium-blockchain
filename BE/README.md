# Artium Web Application - Backend

This repository contains the backend services for the Artium Web Application. It is a monorepo built with [NestJS](https://nestjs.com/) and managed with [Yarn Workspaces](https://yarnpkg.com/features/workspaces).

## Architecture

Most of the services in this monorepo are built using a combination of **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS (Command Query Responsibility Segregation)**, and an **Event-Driven Architecture**.

For more details on the architecture, please see the `apps/readme.md` file.

## Project Structure

The repository is organized as a monorepo with the following structure:

- `apps/`: Contains the individual microservices. Each service has its own `src/`, `test/`, and `Dockerfile`.
- `libs/`: Contains shared libraries used across multiple services. This includes common modules for authentication, RabbitMQ, metrics, etc.
- `dist/`: Contains the compiled output of the services.
- `docs/`: Contains architecture and implementation documentation.
- `docker/`: Contains Docker-related files for infrastructure components like RabbitMQ. 

## Services

This monorepo contains the following services:

- **admin-reporting-service**: Handles administrative reporting and analytics.
- **artwork-service**: Manages artworks, including their organization into folders and tagging.
- **community-service**: Manages community features such as forums and discussions.
- **crm-service**: Handles CRM and marketing automation.
- **events-service**: Manages events and RSVPs.
- **identity-service**: Manages users, authentication, and authorization.
- **messaging-service**: Handles real-time messaging between users.
- **notifications-service**: Sends notifications to users.
- **orders-service**: Manages the checkout process.
- **payments-service**: Processes payments.

## Getting Started

To get started with this project, you will need to have [Node.js](https://nodejs.org/), [Yarn](https://yarnpkg.com/), and [Docker](https://www.docker.com/) installed.

1.  **Install dependencies**:

    ```sh
    yarn install
    ```

2.  **Set up environment variables**:

    Copy the `.env.example` file to `.env` and fill in the required environment variables for each service.

3.  **Start the infrastructure**:

    This will start the required databases and other infrastructure components using Docker.

    ```sh
    yarn docker:up
    ```

4.  **Run all services in development mode**:

    This will start all services with hot-reloading enabled.

    ```sh
    yarn dev:all
    ```

5.  **Run a specific service in development mode**:

    To run a specific service, use the following command:

    ```sh
    yarn dev:<service-name>
    ```

    For example, to run the `identity-service`:

    ```sh
    yarn dev:identity
    ```

## Available Scripts

### Development

- `yarn dev:<service-name>`: Starts a specific service in development mode with hot-reloading.
- `yarn dev:all`: Starts all services in development mode concurrently.

### Production Build & Start

- `yarn build:workspace`: Builds all services in the workspace.
- `yarn build:<service-name>`: Builds a specific service.
- `yarn start:<service-name>`: Starts a specific service from the compiled output.

### Infrastructure (Docker)

- `yarn docker:up`: Starts the development infrastructure using Docker Compose.
- `yarn docker:down`: Stops the development infrastructure.

### Code Quality & Testing

- `yarn format`: Formats the codebase using Prettier.
- `yarn lint`: Lints the codebase using ESLint.
- `yarn test`: Runs all Jest tests.
- `yarn test:watch`: Runs tests in watch mode.
- `yarn test:cov`: Runs tests and generates a coverage report.
- `yarn test:debug`: Runs tests in debug mode.
- `yarn test:e2e`: Runs end-to-end tests.

## Technologies Used

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API**: [GraphQL](https://graphql.org/) (Apollo), REST
- **Database**: [TypeORM](https://typeorm.io/) with PostgreSQL and MySQL
- **Authentication**: [Passport.js](http://www.passportjs.org/) with JWT
- **Messaging**: [RabbitMQ](https://www.rabbitmq.com/)
- **Caching**: [Redis](https://redis.io/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Linting/Formatting**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Testing**: [Jest](https://jestjs.io/)

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a pull request.

## Seeding the Database

The database is automatically seeded with mock data when the application is started in a development environment. The seed data is located in the `db/seeds` directory of each service.

The seeding process is handled by the `SeederModule` and `SeederService` in each service. The `SeederService` is responsible for reading the seed files and inserting the data into the database.

To disable seeding, you can comment out the `onApplicationBootstrap` method in the main module of the respective service.