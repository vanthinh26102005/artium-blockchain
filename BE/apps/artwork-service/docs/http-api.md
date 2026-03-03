# Artwork Service HTTP API

This document outlines the HTTP API endpoints for the Artwork Service.

## Health Controller

Provides endpoints for monitoring service health and status.

- **GET /health**
  - **Description**: Basic health check.
  - **Success Response (200 OK)**:
    ```json
    {
      "status": "healthy",
      "service": "artwork-service",
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
      "service": "artwork-service",
      "timestamp": "2023-10-27T10:00:00.000Z",
      "uptime": 12345,
      "version": "1.0.0",
      "dependencies": {
        "database": "connected",
        "storage_service": "connected",
        "cache_service": "connected"
      }
    }
    ```

## Artworks Controller

Handles REST API endpoints for creating, reading, updating, and deleting artworks.

- **GET /artworks/:id**
  - **Description**: Get a single artwork by ID.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork.
  - **Success Response (200 OK)**: `ArtworkObject`.
  - **Error Response (404 Not Found)**: Artwork not found.

- **GET /artworks**
  - **Description**: Get a list of artworks with optional filtering and pagination.
  - **Query Parameters**:
    - `sellerId` (string, optional): Filter by seller ID.
    - `status` (string, optional): Filter by artwork status (e.g., `available`, `sold`).
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
    - `minPrice` (number, optional): Filter by minimum price.
    - `maxPrice` (number, optional): Filter by maximum price.
  - **Success Response (200 OK)**: An array of `ArtworkObject`.

- **GET /artworks/search**
  - **Description**: Search artworks by query string.
  - **Query Parameters**:
    - `sellerId` (string): The seller ID to search artworks for.
    - `q` (string): Search query string.
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
  - **Success Response (200 OK)**: An array of `ArtworkObject`.

- **GET /artworks/by-tags**
  - **Description**: Get artworks by tags.
  - **Query Parameters**:
    - `sellerId` (string): The seller ID to get artworks for.
    - `tagIds` (string[]): Array of tag IDs to filter by.
    - `match` (string, optional): Match type: `any` (OR) or `all` (AND).
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
  - **Success Response (200 OK)**: An array of `ArtworkObject`.

- **GET /artworks/counts/by-status**
  - **Description**: Get artwork counts by status for a seller.
  - **Query Parameters**:
    - `sellerId` (string): The seller ID to get counts for.
  - **Success Response (200 OK)**: A JSON string containing counts by status.

- **GET /artworks/seller/:sellerId**
  - **Description**: Get artworks by seller.
  - **Parameters**:
    - `sellerId` (string): The seller ID to get artworks for.
  - **Query Parameters**:
    - `status` (string, optional): Filter by artwork status.
    - `skip` (number, optional): Number of records to skip for pagination.
    - `take` (number, optional): Maximum number of records to return.
  - **Success Response (200 OK)**: An array of `ArtworkObject`.

- **POST /artworks**
  - **Description**: Create a new artwork.
  - **Request Body**: `CreateArtworkInput`.
  - **Success Response (201 Created)**: The created `ArtworkObject`.

- **PUT /artworks/:id**
  - **Description**: Update an existing artwork.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork to update.
  - **Request Body**: `UpdateArtworkInput`.
  - **Success Response (200 OK)**: The updated `ArtworkObject`.

- **DELETE /artworks/:id**
  - **Description**: Delete an artwork.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork to delete.
  - **Success Response (200 OK)**: `{ "success": true }`.

- **POST /artworks/:id/mark-sold**
  - **Description**: Mark artwork as sold.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork to mark as sold.
  - **Request Body**: `{ "quantity": number }` (optional, defaults to 1).
  - **Success Response (200 OK)**: The updated `ArtworkObject`.

- **POST /artworks/:id/images**
  - **Description**: Add images to an artwork.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork.
  - **Request Body**: `{ "images": any[] }`.
  - **Success Response (200 OK)**: The updated `ArtworkObject`.

- **DELETE /artworks/:id/images**
  - **Description**: Remove images from an artwork.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork.
  - **Request Body**: `{ "imageIds": string[] }`.
  - **Success Response (200 OK)**: The updated `ArtworkObject`.

- **PUT /artworks/:id/images**
  - **Description**: Update artwork images.
  - **Parameters**:
    - `id` (string): The unique identifier of the artwork.
  - **Request Body**: `{ "images": any[] }`.
  - **Success Response (200 OK)**: The updated `ArtworkObject`.
