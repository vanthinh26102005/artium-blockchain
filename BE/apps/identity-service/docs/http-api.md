# Identity Service HTTP API

This document outlines the HTTP API endpoints for the Identity Service.

## Health Controller

Provides endpoints for monitoring service health and status.

- **GET /health**
  - **Description**: Basic health check.
  - **Success Response (200 OK)**:
    ```json
    {
      "status": "healthy",
      "service": "identity-service",
      "timestamp": "2023-10-27T10:00:00.000Z",
      "uptime": 12345
    }
    ```

- **GET /health/detailed**
  - **Description**: Detailed health check with service dependencies.
  - **Success Response (200 OK)**:
    ```json
    {
      "status": "healthy",
      "service": "identity-service",
      "timestamp": "2023-10-27T10:00:00.000Z",
      "uptime": 12345,
      "version": "1.0.0",
      "dependencies": {
        "database": "connected",
        "redis": "connected"
      }
    }
    ```

## Users Controller

Handles REST API endpoints for user authentication, registration, and profile management.

- **GET /users/me**
  - **Description**: Get current user profile information.
  - **Authentication**: Requires JWT Bearer token.
  - **Success Response (200 OK)**: UserPayload object.
  - **Error Response (401 Unauthorized)**: Invalid or missing JWT token.

- **GET /users/:userId**
  - **Description**: Get user by ID.
  - **Parameters**:
    - `userId` (string): The unique identifier of the user.
  - **Success Response (200 OK)**: UserPayload object.
  - **Error Response (404 Not Found)**: User not found.

- **POST /users/login**
  - **Description**: User login with email and password.
  - **Request Body**: `EmailLoginInput`
  - **Success Response (200 OK)**: `LoginResponse` object.
  - **Error Response (401 Unauthorized)**: Invalid credentials.

- **POST /users/register/initiate**
  - **Description**: Initiate user registration.
  - **Request Body**: `UserRegisterInput`
  - **Success Response (201 Created)**: `RequestOtpResponse` object.
  - **Error Response (400 Bad Request)**: Invalid input or email already exists.

- **POST /users/register/complete**
  - **Description**: Complete user registration with OTP.
  - **Request Body**: `CompleteUserRegisterInput`
  - **Success Response (201 Created)**: `LoginResponse` object.
  - **Error Response (400 Bad Request)**: Invalid OTP or registration data.

- **POST /users/password/reset/request**
  - **Description**: Request password reset.
  - **Request Body**: `RequestPasswordResetInput`
  - **Success Response (200 OK)**: `RequestPasswordResetResponse` object.

- **POST /users/password/reset/verify**
  - **Description**: Verify password reset token.
  - **Request Body**: `VerifyPasswordResetInput`
  - **Success Response (200 OK)**: `VerifyPasswordResetResponse` object.

- **PUT /users/password/reset/confirm**
  - **Description**: Confirm new password after reset.
  - **Request Body**: `ConfirmPasswordResetInput`
  - **Success Response (200 OK)**: `LoginResponse` object.
