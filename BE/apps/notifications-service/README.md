# Notifications Service

This service is responsible for sending notifications to users and maintaining a history of all notifications sent.

## Overview

The Notifications Service is a central microservice for handling all notifications within the Artium platform. It supports multiple channels (Email, SMS, Push, In-App, Webhook) and is built with a focus on reliability and performance, using the CQRS pattern.

## Features

### 📧 Multi-Channel Support
- **Email Notifications**: Integration with an email provider (e.g., SendGrid) for sending emails.
- **SMS Notifications**: Integration with an SMS provider (e.g., Twilio).
- **Push Notifications**: Integration with a push notification provider (e.g., Firebase Cloud Messaging).

### 📊 Tracking & History
- **Notification History**: Keeps a record of every notification sent.
- **Status Tracking**: Tracks the delivery status of each notification.

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **GraphQL**: Apollo Server for the GraphQL API.
- **Database**: PostgreSQL with TypeORM for storing notification history.
- **Email**: `nestjs-modules/mailer` for sending emails.

### Core Components
- **`NotificationHistoryResolver`**: Handles GraphQL queries and mutations for notification history.
- **`SendEmailEventHandler`**: An event handler that sends emails in response to application events.
- **CQRS**: Command and Query handlers for write and read operations.

## GraphQL API

### Queries
- `notificationHistory(id: String!)`: Retrieves a single notification history record by its ID.
- `notificationHistories(options: ListNotificationHistoriesOptionsInput)`: Retrieves a list of notification history records.

### Mutations
- `createNotificationHistory(input: CreateNotificationHistoryInput!)`: Creates a new notification history record.
- `updateNotificationHistory(id: String!, input: UpdateNotificationHistoryInput!)`: Updates an existing notification history record.