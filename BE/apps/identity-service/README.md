# Identity Service

This service is responsible for managing users, authentication, and authorization within the Artium Web Application.

## Overview

The Identity Service is a central microservice that manages the entire user lifecycle, from registration and authentication to access control. It uses a GraphQL API as its primary interface, with a secondary REST API for specific integrations. The service is built with NestJS and follows the CQRS pattern to ensure high performance and scalability.

## Features

### 🔐 Authentication & Authorization
- **Email & Password Authentication**: Log in using an email and password.
- **Google OAuth Integration**: Log in or sign up with a Google account.
- **JWT Token Management**: Secure access with JWT access and refresh tokens.
- **Role-based Access Control (RBAC)**: Manage user permissions based on roles (e.g., ADMIN, SELLER, COLLECTOR).

### 👤 User Management
- **Multi-step Registration**: A secure registration process with OTP verification.
- **Profile Management**: Users can manage their profiles.
- **Account Status Management**: Accounts can be activated or deactivated.
- **Email Verification**: Verify user emails with OTP.

### 🔒 Security
- **Secure Password Reset**: A secure process for users to reset their passwords.
- **Session Management**: Efficiently manage user sessions.
- **Security Logging**: Log important security-related events.
- **Input Validation**: All inputs are validated and sanitized.

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **GraphQL**: Apollo Server with a schema-first approach
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT for authentication and bcrypt for password hashing.
- **Caching**: Redis for caching sessions and other data.
- **External Integrations**: Google OAuth 2.0.

### Core Components
- **`UsersResolver`**: Handles all GraphQL queries and mutations.
- **CQRS**: Command and Query handlers for write and read operations.
- **Authentication Guards**: JWT and Google OAuth guards to protect endpoints.
- **Input Validation**: DTOs with `class-validator` for input validation.

## GraphQL API

The primary way to interact with the Identity Service is through its GraphQL API.

### Queries
- `me`: Returns the currently authenticated user's profile.
- `findById(userId: String!)`: Finds a user by their ID.

### Mutations
- `loginByEmail(loginInput: EmailLoginInput!)`: Logs in a user with their email and password.
- `loginWithGoogle(user: GoogleLoginInput!)`: Logs in or signs up a user with their Google account.
- `initiateUserRegistration(input: UserRegisterInput!)`: Initiates the user registration process by sending an OTP.
- `completeEmailRegistration(input: CompleteUserRegisterInput!)`: Completes the registration process by verifying the OTP and creating the user.
- `requestPasswordReset(input: RequestPasswordResetInput!)`: Initiates the password reset process.
- `verifyPasswordReset(input: VerifyPasswordResetInput!)`: Verifies the password reset token.
- `confirmNewPassword(input: ConfirmPasswordResetInput!)`: Sets a new password for the user.

---

## Support

For questions or to report issues:
- **Issues**: Use the repository's issues section.
- **Documentation**: Refer to the `docs/` directory.
- **Team**: Contact the Identity Service development team.