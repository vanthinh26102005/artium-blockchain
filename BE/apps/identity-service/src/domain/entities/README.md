# Identity Service Entities

This document describes all entities in the identity-service and their relationships.

## Entities Overview

### 1. User
**Purpose:** Core user accounts for authentication and platform access

**Fields:**
- `userId` (PK) - Unique identifier
- `email` - Login email (unique)
- `password` - Hashed password (nullable for OAuth users)
- `fullName` - Display name
- `avatarUrl` - Profile picture
- `googleId` - Google OAuth identifier
- `isEmailVerified` - Email verification status
- `roles` - Platform roles (ADMIN, SELLER, COLLECTOR)
- `stripeCustomerId` - Stripe customer ID for buyer-side payments
- `lastLogin` - Last login timestamp
- `isActive` - Account active status

**Relationships:**
- **→ SellerProfile** (One-to-One): User can have one seller profile
- **Referenced by:**
  - artwork-service: ArtworkLike, ArtworkComment (userId)
  - orders-service: Order (collectorId), ShoppingCart (userId)
  - payments-service: PaymentTransaction (userId), Invoice (collectorId)
  - community-service: Moment, Like, Comment, Follower (userId)
  - All services: Various user references

**Indexes:**
- Unique: `email`, `googleId`
- Composite: `(isActive, createdAt)`

---

### 2. SellerProfile
**Purpose:** Extended profile for users who sell artworks on the platform

**Fields:**
- `profileId` (PK) - Unique identifier
- `userId` - Reference to User (unique, one-to-one)
- `profileType` - INDIVIDUAL, GALLERY, INSTITUTION
- `displayName` - Public seller name
- `slug` - URL-friendly unique identifier
- `bio` - Artist/gallery biography
- `profileImageUrl` - Profile picture
- `coverImageUrl` - Banner image
- `websiteUrl` - Primary website
- `location` - Physical location
- `stripeAccountId` - Stripe Connect account for seller payouts
- `paypalMerchantId` - PayPal merchant account
- Social media URLs (Instagram, Facebook, Twitter, LinkedIn)
- Business details (registration, tax ID, address, phone)
- `isActive` - Profile active status
- `isVerified` - Platform verification status
- `verifiedAt` - Verification timestamp
- Payment onboarding status (Stripe, PayPal)
- **Denormalized metrics:**
  - `soldArtworkCount` - Total artworks sold (eventual consistency)
  - `totalSales` - Total revenue (eventual consistency)
  - `averageRating` - Average rating from testimonials (eventual consistency)
- `isFeatured` - Featured seller status
- `metaDescription` - SEO description
- `tags` - Searchable keywords

**Relationships:**
- **→ User** (One-to-One): Each profile belongs to one user
- **→ SellerWebsite[]** (One-to-Many): Multiple portfolio websites
- **Referenced by:**
  - artwork-service: Artwork (sellerId)
  - orders-service: OrderItem, CartItem (sellerId)
  - payments-service: PaymentTransaction, Invoice (sellerId)
  - crm-service: Contact, PrivateView (sellerId)

**Indexes:**
- Unique: `slug`, `userId`
- Composite: `(isActive, profileType, isVerified)`, `(isFeatured, isActive)`
- Single: `displayName`

**Consistency Notes:**
- Metrics (`soldArtworkCount`, `totalSales`, `averageRating`) are updated asynchronously
- Daily reconciliation jobs sync data from orders-service and community-service
- Use separate API endpoints to fetch real-time stats if needed

---

### 3. SellerWebsite
**Purpose:** Portfolio websites linked to seller profiles

**Fields:**
- `websiteId` (PK) - Unique identifier
- `sellerProfileId` - Reference to SellerProfile
- `url` - Website URL
- `title` - Website title/description
- `displayOrder` - Sort order

**Relationships:**
- **→ SellerProfile** (Many-to-One): Multiple websites per seller
- This is a same-service relationship using TypeORM

---

### 4. RefreshToken
**Purpose:** JWT refresh tokens for authentication

**Fields:**
- `tokenId` (PK) - Unique identifier
- `userId` - Reference to User
- `token` - Hashed refresh token
- `expiresAt` - Expiration timestamp
- `isRevoked` - Revocation status

**Relationships:**
- **→ User** (Many-to-One): Multiple tokens per user
- This is internal to authentication flow

---

## Cross-Service References

**This service is referenced by:**

| Service | Entity | Field | Purpose |
|---------|--------|-------|---------|
| artwork-service | Artwork | `sellerId` | Artwork owner |
| artwork-service | ArtworkLike | `userId` | User who liked |
| artwork-service | ArtworkComment | `userId` | User who commented |
| orders-service | Order | `collectorId` | Buyer |
| orders-service | OrderItem | `sellerId` | Seller of item |
| orders-service | ShoppingCart | `userId` | Cart owner |
| payments-service | PaymentTransaction | `userId`, `sellerId` | Payer and payee |
| payments-service | Invoice | `sellerId`, `collectorId` | Seller and buyer |
| community-service | Moment | `userId` | Moment creator |
| community-service | Like | `userId` | User who liked |
| community-service | Comment | `userId` | Commenter |
| community-service | Follower | `followingUserId`, `followedUserId` | Follow relationship |
| crm-service | Contact | `sellerId` | Contact owner |
| crm-service | PrivateView | `sellerId` | View creator |

**Key Principles:**
- No TypeORM relationships across services
- Other services store only UUIDs
- Fetch full user/seller data via API calls when needed
- This service is the **source of truth** for user and seller profile data
