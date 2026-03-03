# Notifications Service HTTP API

This document outlines the HTTP API endpoints for the Notifications Service.

## Health Controller

Provides endpoints for monitoring service health and status.

- **GET /health**
  - **Description**: Basic health check.
  - **Success Response (200 OK)**:
    ```json
    {
      "status": "healthy",
      "service": "notifications-service",
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
      "service": "notifications-service",
      "timestamp": "2023-10-27T10:00:00.000Z",
      "uptime": 12345,
      "version": "1.0.0",
      "dependencies": {
        "database": "connected",
        "email_service": "connected",
        "sms_service": "connected",
        "push_service": "connected"
      }
    }
    ```

## Notification History Controller

Handles REST API endpoints for creating, reading, and updating notification history records.

- **GET /notification-history/:id**
  - **Description**: Get a single notification history record by ID.
  - **Parameters**:
    - `id` (string): The unique identifier of the notification history record.
  - **Success Response (200 OK)**: `NotificationHistory` object.
  - **Error Response (404 Not Found)**: Notification history not found.

- **GET /notification-history**
  - **Description**: Get a list of notification history records with optional filtering.
  - **Query Parameters**:
    - `userId` (string, optional): Filter by user ID.
    - `channel` (string, optional): Filter by notification channel.
    - `status` (string, optional): Filter by notification status.
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
  - **Success Response (200 OK)**: An array of `NotificationHistory` objects.

- **POST /notification-history**
  - **Description**: Create a new notification history record.
  - **Request Body**: `CreateNotificationHistoryInput`.
  - **Success Response (201 Created)**: The created `NotificationHistory` object.

- **PUT /notification-history/:id**
  - **Description**: Update an existing notification history record.
  - **Parameters**:
    - `id` (string): The unique identifier of the notification history record to update.
  - **Request Body**: `UpdateNotificationHistoryInput`.
  - **Success Response (200 OK)**: The updated `NotificationHistory` object.

- **GET /notification-history/user/:userId**
  - **Description**: Get notification histories by user ID.
  - **Parameters**:
    - `userId` (string): The user ID to filter notifications by.
  - **Query Parameters**:
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
  - **Success Response (200 OK)**: An array of `NotificationHistory` objects.

- **GET /notification-history/stats/summary**
  - **Description**: Get notification statistics.
  - **Success Response (200 OK)**: `NotificationStats` object.

- **PUT /notification-history/:id/mark-sent**
  - **Description**: Mark notification as sent.
  - **Parameters**:
    - `id` (string): The unique identifier of the notification to mark as sent.
  - **Success Response (200 OK)**: The updated `NotificationHistory` object.

- **PUT /notification-history/:id/mark-failed**
  - **Description**: Mark notification as failed.
  - **Parameters**:
    - `id` (string): The unique identifier of the notification to mark as failed.
  - **Request Body**: `{ "failReason": string }` (optional).
  - **Success Response (200 OK)**: The updated `NotificationHistory` object.
