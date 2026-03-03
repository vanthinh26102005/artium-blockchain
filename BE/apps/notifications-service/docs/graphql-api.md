# Notifications Service GraphQL API

This document outlines the GraphQL API for the Notifications Service.

## Queries

- **notificationHistory(id: String!): NotificationHistory**
  - **Description**: Retrieves a single notification history record by its ID.
  - **Arguments**:
    - `id` (String!): The ID of the notification history record to retrieve.
  - **Returns**: The notification history record, or `null` if not found.

- **notificationHistories(options: ListNotificationHistoriesOptionsInput): [NotificationHistory!]**
  - **Description**: Retrieves a list of notification history records, with optional filtering and pagination.
  - **Arguments**:
    - `options` (ListNotificationHistoriesOptionsInput): Options for filtering and pagination.
  - **Returns**: A list of notification history records.

## Mutations

- **createNotificationHistory(input: CreateNotificationHistoryInput!): NotificationHistory**
  - **Description**: Creates a new notification history record.
  - **Arguments**:
    - `input` (CreateNotificationHistoryInput!): The data for the new notification history record.
  - **Returns**: The newly created notification history record.

- **updateNotificationHistory(id: String!, input: UpdateNotificationHistoryInput!): NotificationHistory**
  - **Description**: Updates an existing notification history record.
  - **Arguments**:
    - `id` (String!): The ID of the notification history record to update.
    - `input` (UpdateNotificationHistoryInput!): The data to update the notification history record with.
  - **Returns**: The updated notification history record.
