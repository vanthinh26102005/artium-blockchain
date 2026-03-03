# Notifications Service - REST API Documentation

## Tổng quan

Notifications Service cung cấp REST API for external integrations, backend-to-backend communication, và testing purposes. API này được xây dựng với NestJS framework, bao gồm comprehensive error handling, request tracking, và Swagger documentation.

## Base URL
```
Development: http://localhost:3002
Production: https://notifications.api.artium.com
```

## Authentication

Chỉ có authenticated requests mới được chấp nhận cho operations modification. Public endpoints (GET) không yêu cầu authentication cho public notifications.

```bash
# JWT Token Authentication
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Health Check

#### Basic Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "notifications-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

#### Detailed Health Check
```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "service": "notifications-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "dependencies": {
    "database": "connected",
    "email_service": "connected",
    "sms_service": "connected",
    "push_service": "connected"
  }
}
```

### Notification History Management

#### Get Notification History by ID
```http
GET /notification-history/:id
```

**Path Parameters:**
- `id` (string): UUID của notification history record

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "title": "Welcome to Artium!",
  "body": "Thank you for joining our platform.",
  "channel": "EMAIL",
  "triggerEvent": "USER_REGISTERED_WELCOME",
  "status": "SENT",
  "sentAt": "2024-01-01T00:00:00.000Z",
  "readAt": null,
  "metadata": {},
  "templateContext": {
    "firstName": "John"
  },
  "failureReason": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid ID format
{
  "message": "Notification history ID is required",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history/"
}

// 404 Not Found - Notification not found
{
  "message": "Notification with ID xyz not found",
  "error": "Not Found",
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history/xyz"
}
```

#### List Notification Histories
```http
GET /notification-history
```

**Query Parameters (Optional):**
- `userId` (string): Filter by user ID
- `channel` (string): Filter by channel (EMAIL, SMS, PUSH, IN_APP, WEBHOOK)
- `status` (string): Filter by status (PENDING, SENT, DELIVERED, READ, FAILED)
- `skip` (number): Number of records to skip for pagination (default: 0)
- `take` (number): Maximum number of records to return (default: 20, max: 100)

**Request Examples:**
```http
# Get all notifications for a specific user
GET /notification-history?userId=user123&take=10

# Filter by channel
GET /notification-history?channel=EMAIL&status=SENT

# Pagination
GET /notification-history?skip=20&take=50
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "title": "Welcome to Artium!",
    "body": "Thank you for joining our platform.",
    "channel": "EMAIL",
    "triggerEvent": "USER_REGISTERED_WELCOME",
    "status": "SENT",
    "sentAt": "2024-01-01T00:00:00.000Z",
    "readAt": null,
    "metadata": {},
    "templateContext": {
      "firstName": "John"
    },
    "failureReason": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
```json
// 400 Bad Request - Invalid pagination parameters
{
  "message": "Take must be a positive integer not exceeding 100",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history"
}
```

#### Get Notifications by User ID
```http
GET /notification-history/user/:userId
```

**Path Parameters:**
- `userId` (string): ID of user to get notifications for

**Query Parameters (Optional):**
- `skip` (number): Number of records to skip for pagination
- `take` (number): Maximum number of records to return

**Request Example:**
```http
GET /notification-history/user/user123?take=10
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "title": "Welcome to Artium!",
    "body": "Thank you for joining our platform.",
    "channel": "EMAIL",
    "triggerEvent": "USER_REGISTERED_WELCOME",
    "status": "SENT",
    // ... other fields
  }
]
```

#### Create Notification History
```http
POST /notification-history
```

**Request Body:**
- `userId` (string, required): ID of target user
- `title` (string, required): Notification title
- `body` (string, required): Notification body content
- `channel` (string, required): Delivery channel (EMAIL, SMS, PUSH, IN_APP, WEBHOOK)
- `triggerEvent` (string, required): Event that triggered the notification
- `metadata` (object, optional): Additional metadata
- `templateContext` (object, optional): Template rendering context

**Request Example:**
```json
{
  "userId": "user123",
  "title": "Order Confirmation",
  "body": "Your order #12345 has been confirmed and will be shipped soon.",
  "channel": "EMAIL",
  "triggerEvent": "ORDER_CREATED_CONFIRMATION",
  "metadata": {
    "orderId": "12345",
    "amount": 99.99
  },
  "templateContext": {
    "customerName": "John Doe",
    "orderNumber": "12345",
    "orderAmount": "$99.99"
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "user123",
  "title": "Order Confirmation",
  "body": "Your order #12345 has been confirmed and will be shipped soon.",
  "channel": "EMAIL",
  "triggerEvent": "ORDER_CREATED_CONFIRMATION",
  "status": "PENDING",
  "metadata": {
    "orderId": "12345",
    "amount": 99.99
  },
  "templateContext": {
    "customerName": "John Doe",
    "orderNumber": "12345",
    "orderAmount": "$99.99"
  },
  "sentAt": null,
  "readAt": null,
  "failureReason": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation errors
{
  "message": "User ID is required",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history"
}

// 400 Bad Request - Invalid channel
{
  "message": "Invalid channel. Allowed values: email, sms, push, in_app, webhook",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history"
}
```

#### Update Notification History
```http
PUT /notification-history/:id
```

**Path Parameters:**
- `id` (string): UUID of notification history record to update

**Request Body (all optional):**
- `status` (string): New status (PENDING, SENT, DELIVERED, READ, FAILED)
- `sentAt` (string|null): ISO 8601 datetime or null
- `readAt` (string|null): ISO 8601 datetime or null
- `failureReason` (string|null): Reason for failure if status is FAILED
- `metadata` (object): Additional metadata updates
- `templateContext` (object): Template context updates

**Request Example:**
```json
{
  "status": "SENT",
  "sentAt": "2024-01-01T00:01:00.000Z",
  "metadata": {
    "providerMessageId": "sendgrid_msg_123",
    "provider": "sendgrid"
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "user123",
  "title": "Order Confirmation",
  "body": "Your order #12345 has been confirmed and will be shipped soon.",
  "channel": "EMAIL",
  "triggerEvent": "ORDER_CREATED_CONFIRMATION",
  "status": "SENT",
  "sentAt": "2024-01-01T00:01:00.000Z",
  "readAt": null,
  "failureReason": null,
  "metadata": {
    "orderId": "12345",
    "amount": 99.99,
    "providerMessageId": "sendgrid_msg_123",
    "provider": "sendgrid"
  },
  "templateContext": {
    "customerName": "John Doe",
    "orderNumber": "12345",
    "orderAmount": "$99.99"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:01:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid status
{
  "message": "Invalid status. Allowed values: pending, sent, delivered, read, failed",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history/550e8400-e29b-41d4-a716-446655440001"
}

// 400 Bad Request - Invalid date format
{
  "message": "Invalid sentAt value. Must be a valid date or null",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history/550e8400-e29b-41d4-a716-446655440001"
}

// 404 Not Found - Notification doesn't exist
{
  "message": "Notification with ID xyz not found",
  "error": "Not Found",
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history/xyz"
}
```

### Notification Status Management

#### Mark Notification as Sent
```http
PUT /notification-history/:id/mark-sent
```

**Path Parameters:**
- `id` (string): UUID of notification to mark as sent

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "user123",
  "title": "Order Confirmation",
  "body": "Your order #12345 has been confirmed and will be shipped soon.",
  "channel": "EMAIL",
  "triggerEvent": "ORDER_CREATED_CONFIRMATION",
  "status": "SENT",
  "sentAt": "2024-01-01T00:01:00.000Z",
  "readAt": null,
  "failureReason": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:01:00.000Z"
}
```

#### Mark Notification as Failed
```http
PUT /notification-history/:id/mark-failed
```

**Path Parameters:**
- `id` (string): UUID of notification to mark as failed

**Request Body (Optional):**
- `failReason` (string): Reason for failure

**Request Example:**
```json
{
  "failReason": "Email bounced - invalid recipient address"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "user123",
  "title": "Order Confirmation",
  "body": "Your order #12345 has been confirmed and will be shipped soon.",
  "channel": "EMAIL",
  "triggerEvent": "ORDER_CREATED_CONFIRMATION",
  "status": "FAILED",
  "sentAt": null,
  "readAt": null,
  "failureReason": "Email bounced - invalid recipient address",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:01:00.000Z"
}
```

### Statistics and Analytics

#### Get Notification Statistics
```http
GET /notification-history/stats/summary
```

**Response:**
```json
{
  "total": 1500,
  "pending": 50,
  "sent": 1200,
  "failed": 100,
  "delivered": 1100,
  "byChannel": {
    "email": 800,
    "sms": 300,
    "push": 250,
    "in_app": 100,
    "webhook": 50
  },
  "last24h": 120,
  "last7d": 800,
  "last30d": 1500
}
```

## Error Handling Strategy

### Error Types
1. **BadRequestException (400)**: Invalid input, validation errors
2. **NotFoundException (404)**: Resource not found
3. **UnauthorizedException (401)**: Missing or invalid authentication
4. **ForbiddenException (403)**: Insufficient permissions
5. **InternalServerErrorException (500)**: Server-side errors

### Error Response Format
Tất cả error responses tuân theo consistent format:

```json
{
  "message": "Human-readable error description",
  "error": "Error type (e.g., Bad Request)", 
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/endpoint/that/failed"
}
```

### Request Tracking
Mọi request được assigned một unique ID cho debugging purposes:

```http
X-Request-ID: req_1704067200_abc123456
```

Controller sử dụng request ID này trong logs:

```typescript
this.logger.log(`[NotificationHistoryController] [ReqID: ${requestId}] - Operation completed`);
```

## Input Validation

### Validation Rules
- **User ID**: Required, minimum 10 characters (UUID format)
- **Title**: Required, 1-255 characters
- **Body**: Required, 1-2000 characters  
- **Channel**: Required, enum: EMAIL, SMS, PUSH, IN_APP, WEBHOOK
- **Status**: enum: PENDING, SENT, DELIVERED, READ, FAILED
- **Trigger Event**: Required, 1-100 characters
- **Pagination**: skip >= 0, take 1-100

### Sanitization
- Email addresses được validated và normalized
- HTML content được escaped hoặc stripped tùy theo channel
- Special characters được encoded để prevent XSS
- SQL injection protection thông qua parameterized queries

## Rate Limiting

### Default Limits
- **Global**: 1000 requests per minute
- **Per User**: 100 requests per hour
- **Per IP**: 50 requests per minute
- **Create Operations**: 20 requests per minute

### HTTP Headers
Rate limiting information được include trong response headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

### Rate Limiting Response
Khi limit exceeded:

```json
{
  "message": "Rate limit exceeded",
  "error": "Too Many Requests",
  "statusCode": 429,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/notification-history"
}
```

## Security

### Authentication
- JWT token validation cho protected endpoints
- Token expiration checking
- Role-based access control (RBAC)

### Authorization
- Users chỉ có thể access notifications của chính họ
- Admin users có thể access tất cả notifications
- Service-to-service communication với service accounts

### Data Privacy
- Sensitive data được sanitized trong logs
- PII được encrypted trong database
- Audit trail cho all modifications

## Usage Examples

### Using curl

#### Create Notification
```bash
curl -X POST http://localhost:3002/notification-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "userId": "user123",
    "title": "Welcome to Artium!",
    "body": "Thank you for joining our platform.",
    "channel": "EMAIL",
    "triggerEvent": "USER_REGISTERED_WELCOME",
    "templateContext": {
      "firstName": "John"
    }
  }'
```

#### Get User Notifications
```bash
curl -X GET "http://localhost:3002/notification-history/user/user123?take=10" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Mark as Sent
```bash
curl -X PUT http://localhost:3002/notification-history/550e8400-e29b-41d4-a716-446655440001/mark-sent \
  -H "Authorization: Bearer your-jwt-token"
```

### Using JavaScript (fetch)

```javascript
// Create notification
const createNotification = async (notificationData) => {
  const response = await fetch('/notification-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(notificationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  const params = new URLSearchParams({
    ...options,
    userId
  });
  
  const response = await fetch(`/notification-history/user/${userId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Handle errors
try {
  const notification = await createNotification({
    userId: 'user123',
    title: 'Test Notification',
    body: 'This is a test',
    channel: 'IN_APP',
    triggerEvent: 'GENERIC_ALERT'
  });
  
  console.log('Notification created:', notification.id);
} catch (error) {
  console.error('Failed to create notification:', error.message);
  
  if (error.message.includes('Rate limit')) {
    // Handle rate limiting
  }
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Test Structure
- **Unit Tests**: Individual controller and service method testing
- **Integration Tests**: End-to-end API testing with real database
- **Security Tests**: Authentication, authorization, and input validation testing
- **Performance Tests**: Load testing và response time measurement

## Swagger/OpenAPI Documentation

### Accessing Documentation
- **Development**: http://localhost:3002/api-docs
- **Production**: https://notifications.api.artium.com/api-docs

The Swagger UI provides:
- Interactive API testing
- Request/response schema documentation
- Authentication setup instructions
- Example requests for all endpoints

## Troubleshooting

### Common Issues

#### 1. 401 Unauthorized
**Cause:** Missing or invalid JWT token
**Solution:** Include valid Bearer token in Authorization header

#### 2. 400 Bad Request - Validation Error
**Cause:** Required fields missing or invalid data format
**Solution:** Check request body against API documentation

#### 3. 404 Not Found
**Cause:** Resource doesn't exist or incorrect ID format
**Solution:** Verify resource ID or check if resource was created

#### 4. 429 Too Many Requests
**Cause:** Rate limit exceeded
**Solution:** Implement exponential backoff retry logic

#### 5. 500 Internal Server Error
**Cause:** Database connectivity or processing error
**Solution:** Check service health and contact support

### Debugging Tips

1. **Use Request ID:**
   ```bash
   curl -X GET http://localhost:3002/notification-history/123 \
     -H "Authorization: Bearer token" \
     -v  # verbose mode to see X-Request-ID
   ```

2. **Check Headers:**
   ```bash
   # Inspect rate limiting headers
   curl -I http://localhost:3002/notification-history
   ```

3. **Response Time:**
   ```bash
   # Measure response time
   time curl -X GET http://localhost:3002/health
   ```

## Support

For API support:
- **Documentation**: /api-docs endpoint
- **Issues**: Repository issue tracker
- **Team**: Notifications Service team
- **Status**: Health check endpoints and status page

---

*Notifications Service REST API provides secure, reliable, and well-documented endpoints for external integrations and system communication.*
