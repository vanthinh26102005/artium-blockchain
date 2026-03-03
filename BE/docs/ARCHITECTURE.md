# Artium Backend Architecture Documentation

## Overview

This is a **microservices-based backend** for an artwork selling platform built with NestJS, following **Domain-Driven Design (DDD)**, **Clean Architecture**, and **CQRS** patterns.

---

## Table of Contents

1. [Architecture Patterns](#architecture-patterns)
2. [Service Overview](#service-overview)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Service Integration Points](#service-integration-points)
5. [Database Architecture](#database-architecture)
6. [Event-Driven Communication](#event-driven-communication)
7. [Technology Stack](#technology-stack)

---

## Architecture Patterns

### 1. **Microservices Architecture**
- **Database per Service**: Each service has its own PostgreSQL database
- **Service Independence**: Services can be deployed and scaled independently
- **Inter-service Communication**: Event-driven architecture using RabbitMQ

### 2. **Clean Architecture (4 Layers)**
```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Controllers, GraphQL Resolvers)       │
├─────────────────────────────────────────┤
│        Application Layer                │
│  (Commands, Queries, Event Handlers)    │
├─────────────────────────────────────────┤
│        Domain Layer                     │
│  (Entities, DTOs, Interfaces)           │
├─────────────────────────────────────────┤
│        Infrastructure Layer             │
│  (Repositories, External Services)      │
└─────────────────────────────────────────┘
```

### 3. **CQRS (Command Query Responsibility Segregation)**
- **Commands**: Modify state (Create, Update, Delete)
- **Queries**: Read state (Get, List, Search)
- Separate handlers for each operation

### 4. **Event-Driven Architecture**
- **Transactional Outbox Pattern**: Ensures reliable event publishing
- **RabbitMQ**: Message broker for async communication
- **Domain Events**: Published after successful state changes

---

## Service Overview

### ✅ **Completed Services** (DO NOT MODIFY)

#### 1. **identity-service** (Port 5432)
**Purpose**: User authentication, authorization, and profile management

**Key Entities**:
- `User`: Core user accounts with email, Google OAuth, roles (ADMIN, SELLER, COLLECTOR)
- `RefreshToken`: JWT refresh token management
- `SellerProfile`: Extended profile for sellers/galleries
- `SellerWebsite`: Seller contact information

**Key Features**:
- Email/password registration
- Google OAuth integration
- JWT access + refresh tokens
- Password reset flow
- User role management

---

#### 2. **artwork-service** (Port 5434)
**Purpose**: Artwork catalog management

**Key Entities**:
- `Artwork`: Artwork details, pricing, images, status
- `ArtworkFolder`: Hierarchical folder organization
- `Tag`: Artwork tagging system (custom & verified)

**Key Features**:
- Artwork CRUD operations
- Folder-based organization
- Tagging and categorization
- Search and filtering
- Status management (DRAFT, ACTIVE, SOLD, ARCHIVED)

---

#### 3. **notifications-service** (Port 5433)
**Purpose**: Multi-channel notification system

**Key Entities**:
- `NotificationHistory`: Tracks all sent notifications

**Key Features**:
- Email notifications (Nodemailer)
- Push notifications (Firebase)
- SMS notifications
- In-app notifications
- Notification templates
- Delivery tracking

---

#### 4. **messaging-service** (Port 5435)
**Purpose**: Real-time messaging between users

**Enhanced Entities**:
- `Conversation`: Enhanced with types (DIRECT, GROUP, EVENT_CHAT, INQUIRY)
- `Message`: Enhanced with reactions, mentions, attachments
- `ConversationParticipant`: Tracks participants
- `MessageAttachment`: File/artwork/moodboard sharing
- `ReadReceipt`: Message read tracking
- `TypingIndicator`: Real-time typing status

**Key Features**:
- WebSocket support for real-time chat
- One-on-one and group messaging
- Artwork/moodboard sharing in chats
- Event-specific chat rooms
- Read receipts and typing indicators
- Message reactions and replies

---

### 🚧 **Services Requiring Implementation**

#### 5. **payments-service**
**Purpose**: Multi-provider payment processing

**New Entities**:
- `Invoice`: Invoice generation (existing, basic)
- `InvoiceItem`: Line items for invoices (existing, basic)
- `PaymentMethod`: Saved payment methods (Stripe, PayPal)
- `PaymentTransaction`: Unified transaction history
- `Payout`: Seller payout tracking

**Implementation Priorities**:
1. Stripe payment intents integration
2. PayPal checkout integration
3. Payment webhooks (Stripe, PayPal)
4. Invoice generation
5. Refund processing
6. Seller payout management

**Integration Points**:
- → `orders-service`: Process order payments
- → `identity-service`: Retrieve Stripe customer/account IDs
- → `notifications-service`: Send payment confirmations

---

#### 6. **orders-service**
**Purpose**: Shopping cart and order management

**Enhanced Entities**:
- `Order`: Enhanced with shipping tracking, payment details, lifecycle
- `OrderItem`: Enhanced with artwork snapshots, payout tracking
- `ShoppingCart`: Persistent cart per user
- `CartItem`: Individual cart items with cached artwork info

**Implementation Priorities**:
1. Shopping cart CRUD operations
2. Checkout flow implementation
3. Order creation and management
4. Shipping address management
5. Order status tracking
6. Integration with payments and artwork services

**Integration Points**:
- → `payments-service`: Process payments
- → `artwork-service`: Check availability, update inventory
- → `identity-service`: Get buyer/seller info
- → `notifications-service`: Order confirmations, shipping updates

---

#### 7. **events-service**
**Purpose**: Event management for marketing artworks

**Enhanced Entities**:
- `Event`: Enhanced with types, capacity, pricing, registration
- `EventRsvp`: Enhanced with guest details, attendance tracking
- `EventArtwork`: Junction table for showcasing artworks at events
- `EventAttendee`: Actual attendance tracking (separate from RSVP)

**Implementation Priorities**:
1. Event CRUD operations
2. RSVP management
3. Guest list management
4. Check-in system
5. Event artwork showcasing
6. Event analytics

**Integration Points**:
- → `artwork-service`: Link artworks to events
- → `identity-service`: Get seller/attendee info
- → `messaging-service`: Create event chat rooms
- → `notifications-service`: Event reminders, updates

---

#### 8. **community-service**
**Purpose**: Social features and user engagement

**Enhanced Entities**:
- `Follower`: User follow relationships (existing, basic)
- `Moment`: Enhanced Instagram-style stories with engagement
- `Moodboard`: Enhanced with collaboration, engagement
- `MoodboardArtwork`: Junction table (existing, basic)
- `Testimonial`: Reviews/testimonials (existing, basic)
- `Like`: Universal like system
- `Comment`: Universal comment system with nesting
- `ActivityFeed`: User activity stream
- `MomentView`: Moment view analytics

**Implementation Priorities**:
1. Follow/unfollow functionality
2. Moment creation and viewing
3. Moodboard CRUD with collaboration
4. Like and comment systems
5. Activity feed generation
6. Engagement analytics

**Integration Points**:
- → `artwork-service`: Link artworks to moodboards/moments
- → `identity-service`: Get user profiles
- → `notifications-service`: Social notifications (likes, comments, follows)

---

#### 9. **crm-service**
**Purpose**: Marketing automation and CRM

**Enhanced Entities**:
- `Contact`: Enhanced with segmentation, engagement tracking
- `EmailCampaign`: Enhanced with scheduling, A/B testing, analytics
- `Promotion`: Discount codes (existing, basic)
- `PrivateView`: VIP client previews (existing, basic)
- `PrivateViewArtwork`: Junction table (existing, basic)
- `CustomerSegment`: Dynamic and static segmentation
- `CampaignRecipient`: Individual email tracking

**Implementation Priorities**:
1. Contact management and import
2. Customer segmentation (dynamic rules)
3. Email campaign creation and scheduling
4. Campaign analytics and tracking
5. Promotion code system
6. Private view management

**Integration Points**:
- → `identity-service`: Sync user data to contacts
- → `orders-service`: Track purchases for segmentation
- → `notifications-service`: Send email campaigns
- → `artwork-service`: Link artworks to campaigns

---

## Entity Relationship Diagram

### Cross-Service Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                     IDENTITY-SERVICE                              │
├──────────────────────────────────────────────────────────────────┤
│ User (id, email, roles, stripeCustomerId)                        │
│ ├─ RefreshToken                                                  │
│ └─ SellerProfile (profileId, stripeAccountId)                    │
│    └─ SellerWebsite                                              │
└──────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ userId             │ userId             │ profileId
         ▼                    ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ MESSAGING       │  │ COMMUNITY        │  │ ARTWORK             │
├─────────────────┤  ├──────────────────┤  ├─────────────────────┤
│ Conversation    │  │ Follower         │  │ Artwork (sellerId)  │
│ ├─ Message      │  │ Moment           │  │ ├─ Tag              │
│ ├─ Participant  │  │ Moodboard        │  │ └─ ArtworkFolder    │
│ ├─ Attachment   │  │ ├─ MoodboardArt  │  └─────────────────────┘
│ ├─ ReadReceipt  │  │ Like             │           │ artworkId
│ └─ Typing       │  │ Comment          │           ▼
└─────────────────┘  │ ActivityFeed     │  ┌─────────────────────┐
                     │ MomentView       │  │ orders     │
                     │ Testimonial      │  ├─────────────────────┤
                     └──────────────────┘  │ Order (collectorId) │
                              │            │ ├─ OrderItem        │
                              │ userId     │    ShoppingCart     │
                              ▼            │ └─ CartItem         │
                     ┌──────────────────┐  └─────────────────────┘
                     │ NOTIFICATIONS    │           │ orderId
                     ├──────────────────┤           ▼
                     │ Notification     │  ┌─────────────────────┐
                     │ History          │  │ PAYMENTS            │
                     └──────────────────┘  ├─────────────────────┤
                                           │ PaymentTransaction  │
                                           │ PaymentMethod       │
                                           │ Invoice             │
                                           │ ├─ InvoiceItem      │
                                           │ Payout              │
                                           └─────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     events-SERVICE                           │
├──────────────────────────────────────────────────────────────────┤
│ Event (creatorId → SellerProfile.profileId)                      │
│ ├─ EventRsvp (userId → user.id)                                  │
│ ├─ EventArtwork (artworkId → Artwork.id)                         │
│ └─ EventAttendee                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   crm-SERVICE                           │
├──────────────────────────────────────────────────────────────────┤
│ Contact (sellerId → SellerProfile.profileId)                     │
│ ├─ CustomerSegment                                               │
│ EmailCampaign                                                     │
│ ├─ CampaignRecipient                                             │
│ Promotion                                                         │
│ PrivateView                                                       │
│ └─ PrivateViewArtwork                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Service Integration Points

### Key Integration Patterns

#### 1. **Synchronous Integration** (Rare)
- Used only for critical, real-time operations
- Example: Checking artwork availability during checkout

#### 2. **Asynchronous Integration** (Primary)
- Event-driven via RabbitMQ
- Eventual consistency model
- Example: Order created → Notify user, Update inventory

#### 3. **Data References**
- Services store foreign IDs but don't enforce foreign keys
- Example: `Order.collectorId` references `user.id` from identity-service

---

### Example Integration Flows

#### **Order Creation Flow**
```
1. User adds artwork to cart (orders-service)
2. User initiates checkout (orders-service)
3. Create payment intent (payments-service)
   → Stripe/PayPal API call
4. User completes payment
5. Webhook received (payments-service)
   → Publish PaymentSucceeded event
6. Order confirmed (orders-service)
   → Publish OrderConfirmed event
7. Artwork marked as sold (artwork-service)
   → Subscribe to OrderConfirmed
8. Notification sent (notifications-service)
   → Subscribe to OrderConfirmed
9. Payout scheduled (payments-service)
   → Schedule seller payout
```

#### **Event RSVP Flow**
```
1. Seller creates event (events-service)
   → Publish EventCreated
2. User RSVPs (events-service)
   → Publish UserRSVPed
3. Event chat created (messaging-service)
   → Subscribe to EventCreated
4. Notification sent (notifications-service)
   → Subscribe to UserRSVPed
5. Activity recorded (community-service)
   → Subscribe to UserRSVPed
```

#### **Social Interaction Flow**
```
1. User posts moment (community-service)
   → Publish MomentCreated
2. Activity feed updated (community-service)
   → Internal update
3. Followers notified (notifications-service)
   → Subscribe to MomentCreated
4. User likes moment (community-service)
   → Publish MomentLiked
5. Moment owner notified (notifications-service)
   → Subscribe to MomentLiked
```

---

## Database Architecture

### Database-per-Service Pattern

Each service maintains its own database for independence:

```
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL Instance                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│ │ identity_db   │  │ artwork_db    │  │ orders_db     │   │
│ │ (Port 5432)   │  │ (Port 5434)   │  │ (Port 5436)   │   │
│ └───────────────┘  └───────────────┘  └───────────────┘   │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│ │ notifications │  │ messaging_db  │  │ payments_db   │   │
│ │ (Port 5433)   │  │ (Port 5435)   │  │ (Port 5437)   │   │
│ └───────────────┘  └───────────────┘  └───────────────┘   │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│ │ events_db     │  │ community_db  │  │ crm_db        │   │
│ │ (Port 5438)   │  │ (Port 5439)   │  │ (Port 5440)   │   │
│ └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Shared Infrastructure

```
┌──────────────────┐
│ Redis (Cache)    │ ← Shared caching layer
└──────────────────┘

┌──────────────────┐
│ RabbitMQ         │ ← Event bus
└──────────────────┘

┌──────────────────┐
│ Cloudinary       │ ← Media storage
└──────────────────┘
```

---

## Event-Driven Communication

### Outbox Pattern

Each service uses the **Transactional Outbox Pattern** to ensure reliable event publishing:

```sql
-- Every service has an outbox table
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  aggregate_type VARCHAR,
  aggregate_id VARCHAR,
  event_type VARCHAR,
  payload JSONB,
  status VARCHAR, -- PENDING, PUBLISHED, FAILED
  created_at TIMESTAMP
);
```

### Event Flow

```
1. Service executes business logic in transaction
2. Domain event saved to outbox table (same transaction)
3. Transaction commits
4. Outbox processor publishes event to RabbitMQ
5. Other services subscribe and react
```

### Key Domain Events

#### **identity-service**
- `UserRegistered`
- `UserRoleChanged`
- `SellerProfileCreated`

#### **artwork-service**
- `ArtworkCreated`
- `ArtworkPublished`
- `ArtworkSold`

#### **orders-service**
- `OrderCreated`
- `OrderConfirmed`
- `OrderShipped`
- `OrderDelivered`

#### **payments-service**
- `PaymentSucceeded`
- `PaymentFailed`
- `RefundProcessed`
- `PayoutCompleted`

#### **events-service**
- `EventCreated`
- `EventPublished`
- `UserRSVPed`
- `EventCancelled`

#### **community-service**
- `MomentCreated`
- `ArtworkLiked`
- `CommentAdded`
- `UserFollowed`

#### **messaging-service**
- `MessageSent`
- `ConversationCreated`

---

## Technology Stack

### Core Framework
- **NestJS 11.x**: Backend framework
- **TypeORM 0.3.x**: ORM for PostgreSQL
- **PostgreSQL 17**: Primary database

### Communication
- **GraphQL (Apollo Server)**: Query API
- **REST**: Command API
- **WebSocket (Socket.io)**: Real-time messaging
- **RabbitMQ**: Message broker

### Authentication & Authorization
- **Passport.js**: Auth strategies
- **JWT**: Access + refresh tokens
- **Google OAuth 2.0**: Social login

### External Services
- **Stripe**: Payment processing
- **PayPal**: Payment processing
- **Cloudinary**: Media storage
- **Firebase Admin**: Push notifications
- **Nodemailer**: Email sending

### Monitoring & DevOps
- **Docker**: Containerization
- **Docker Compose**: Local development
- **Health Checks**: Database and service health

---

## Next Steps

### Phase 1: Core E-commerce (Weeks 1-4)
1. Implement **payments-service**
   - Stripe integration
   - PayPal integration
   - Webhook handlers
   - Invoice generation

2. Implement **orders-service**
   - Shopping cart
   - Checkout flow
   - Order management
   - Integration with payments

### Phase 2: Marketing & Events (Weeks 5-7)
3. Implement **events-service**
   - Event CRUD
   - RSVP management
   - Check-in system

4. Implement **crm-service**
   - Contact management
   - Email campaigns
   - Segmentation

### Phase 3: Community & Social (Weeks 8-10)
5. Implement **community-service**
   - Social features
   - Activity feeds
   - Engagement systems

6. Enhance **messaging-service**
   - Artwork sharing
   - Event chats
   - Read receipts

---

## Database Migration Strategy

Since `synchronize: true` is currently enabled:

1. **Development**: Keep synchronize enabled for rapid prototyping
2. **Production**:
   - Disable synchronize
   - Create TypeORM migrations
   - Use migration scripts for schema changes

Example migration:
```bash
npm run typeorm:migration:generate -- -n CreatePaymentMethodTable
npm run typeorm:migration:run
```

---

## Testing Strategy

### Unit Tests
- Test individual command/query handlers
- Test domain services
- Mock repositories and external services

### Integration Tests
- Test API endpoints (REST + GraphQL)
- Test event handlers
- Use test database

### E2E Tests
- Test complete user flows
- Test cross-service integrations
- Use Docker Compose for full stack

---

## Security Considerations

### Authentication
- JWT with short-lived access tokens (15 minutes)
- Refresh tokens with rotation
- Google OAuth for social login

### Authorization
- Role-based access control (RBAC)
- Seller-specific resources protected
- Admin-only operations guarded

### Payment Security
- Never store credit card numbers
- Use Stripe/PayPal tokenization
- PCI DSS compliance via providers

### Data Privacy
- User data encrypted at rest
- HTTPS/TLS for all communications
- GDPR-compliant data handling

---

## Performance Optimization

### Caching Strategy
- Redis for session storage
- Cache frequently accessed data (user profiles, artwork listings)
- Cache invalidation via events

### Database Optimization
- Indexes on foreign keys and query fields
- Pagination for large result sets
- Read replicas for scaling reads

### Event Processing
- Async event handling for non-critical operations
- Retry mechanisms for failed events
- Dead letter queues for persistent failures

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / API Gateway              │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Service Cluster │  │ Service Cluster │  │ Service Cluster │
│ (identity, art) │  │ (orders, pay)   │  │ (events, comm)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ PostgreSQL      │  │ Redis           │  │ RabbitMQ        │
│ (Multi-DB)      │  │ (Cache/Session) │  │ (Message Broker)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Conclusion

This architecture provides a **scalable, maintainable, and professional** foundation for the Artium artwork selling platform. The microservices design allows independent development and deployment of features, while the event-driven approach ensures loose coupling and system resilience.

The entity redesigns maintain backward compatibility with existing services (identity, artwork, notifications) while adding comprehensive functionality for e-commerce, marketing, events, and community features.

**Key Strengths**:
- ✅ Clean separation of concerns
- ✅ Independent service scaling
- ✅ Event-driven resilience
- ✅ Multi-provider payment support
- ✅ Comprehensive social features
- ✅ Professional CRM and marketing tools
