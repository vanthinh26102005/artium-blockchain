# Artwork Service Entities

This document describes all entities in the artwork-service and their relationships.

## Entities Overview

### 1. Artwork
**Purpose:** Artworks listed for sale or exhibition on the platform

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `title` - Artwork title
- `description` - Detailed description
- `creationYear` - Year created
- `editionRun` - Edition information (e.g., "5/100")
- `dimensions` - Physical dimensions (height, width, depth, unit)
- `weight` - Weight (value, unit)
- `materials` - Materials and media used
- `location` - Physical location
- `price` - Sale price
- `currency` - Currency code (USD, EUR, etc.)
- `quantity` - Available quantity
- `status` - Lifecycle status (DRAFT, PUBLISHED, SOLD, etc.)
- `isPublished` - Published visibility flag
- `images` - Array of artwork images (JSONB)
- `folderId` - Reference to ArtworkFolder (same service)
- **Metrics (denormalized):**
  - `viewCount` - Total views (eventual consistency)
  - `likeCount` - Total likes (eventual consistency)
  - `commentCount` - Total comments (eventual consistency)
  - `moodboardCount` - Times added to moodboards (eventual consistency)

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **→ ArtworkFolder** (Many-to-One): Same service, TypeORM relationship allowed
- **→ ArtworkTag[]** (Many-to-Many): Via junction table
- **← ArtworkLike[]** (One-to-Many): Likes on this artwork
- **← ArtworkComment[]** (One-to-Many): Comments on this artwork
- **Referenced by:**
  - orders-service: OrderItem, CartItem (artworkId)
  - community-service: MomentTaggedArtwork, MoodboardArtwork (artworkId)
  - crm-service: PrivateViewArtwork (artworkId)
  - events-service: EventArtwork (artworkId)

**Indexes:**
- Composite: `(sellerId, status)`, `(sellerId, isPublished, createdAt)`, `(status, isPublished)`
- Single: `createdAt`

---

### 2. ArtworkLike
**Purpose:** User likes on artworks (migrated from community-service)

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `artworkId` - Reference to Artwork (same service)
- `sellerId` - Denormalized from Artwork.sellerId for query optimization
- `createdAt` - When like was created

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ Artwork** (Same-service): Via `artworkId`
- **→ SellerProfile** (Cross-service): Denormalized `sellerId` for filtering

**Indexes:**
- Unique: `(userId, artworkId)` - User can only like once
- Composite: `(artworkId, createdAt)`, `(sellerId, createdAt)`, `(userId, createdAt)`

**Migration Note:**
- This entity was moved from `community_service.likes` WHERE `likeable_type = 'ARTWORK'`
- Artwork likes are now owned by artwork-service for better service autonomy

---

### 3. ArtworkComment
**Purpose:** User comments/reviews on artworks (migrated from community-service)

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `artworkId` - Reference to Artwork (same service)
- `sellerId` - Denormalized from Artwork.sellerId for notifications
- `parentCommentId` - Reference to parent comment for nested replies
- `content` - Comment text
- `mediaUrl` - Optional media attachment
- `mentionedUserIds` - Array of mentioned user IDs (JSONB)
- `likeCount` - Number of likes (eventual consistency)
- `replyCount` - Number of replies (eventual consistency)
- `isEdited` - Edit status
- `editedAt` - Edit timestamp
- `isDeleted` - Soft delete status
- `deletedAt` - Delete timestamp
- `isFlagged` - Flagged for moderation
- `createdAt`, `updatedAt` - Timestamps

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ Artwork** (Same-service): Via `artworkId`
- **→ ArtworkComment** (Self-reference): Via `parentCommentId` for nested replies
- **← ArtworkCommentLike[]** (One-to-Many): Likes on this comment

**Indexes:**
- Composite: `(artworkId, createdAt)`, `(artworkId, parentCommentId)`, `(userId, createdAt)`, `(isDeleted, createdAt)`
- Single: `sellerId`

**Migration Note:**
- Moved from `community_service.comments` WHERE `commentable_type = 'ARTWORK'`
- Supports nested replies via `parentCommentId`

---

### 4. ArtworkCommentLike
**Purpose:** Likes on artwork comments

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `commentId` - Reference to ArtworkComment (same service)
- `createdAt` - When like was created

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ ArtworkComment** (Same-service): Via `commentId`

**Indexes:**
- Unique: `(userId, commentId)` - User can only like comment once
- Composite: `(commentId, createdAt)`

---

### 5. ArtworkTag
**Purpose:** Explicit junction table linking artworks to tags

**Fields:**
- `artworkId` (PK) - Reference to Artwork
- `tagId` (PK) - Reference to Tag
- `createdAt` - When tag was added

**Relationships:**
- **→ Artwork** (Same-service): Many-to-Many via junction
- **→ Tag** (Same-service): Many-to-Many via junction

**Indexes:**
- Unique: `(artworkId, tagId)`
- Single: `tagId`

**Migration Note:**
- Replaces implicit join table created by TypeORM `@ManyToMany` decorator
- Explicit table allows better control and auditing

---

### 6. Tag
**Purpose:** Tags/categories for artworks (e.g., "Abstract", "Oil Painting")

**Fields:**
- `id` (PK) - Unique identifier
- `name` - Tag name
- `slug` - URL-friendly slug
- Additional metadata fields

**Relationships:**
- **→ Artwork[]** (Many-to-Many): Via ArtworkTag junction table

---

### 7. ArtworkFolder
**Purpose:** Organization folders for artworks

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `name` - Folder name
- Additional metadata fields

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **← Artwork[]** (One-to-Many): Same service, TypeORM relationship allowed

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | SellerProfile | `sellerId` | Artwork owner |
| identity-service | User | `userId` | Like/comment author |

**This service is referenced by:**

| Service | Entity | Field | Purpose |
|---------|--------|-------|---------|
| orders-service | OrderItem | `artworkId` | Item purchased |
| orders-service | CartItem | `artworkId` | Item in cart |
| community-service | MomentTaggedArtwork | `artworkId` | Tagged in moment |
| community-service | MoodboardArtwork | `artworkId` | Added to moodboard |
| crm-service | PrivateViewArtwork | `artworkId` | In private view |
| events-service | EventArtwork | `artworkId` | Featured in event |

---

## Migration Strategy

### From community-service to artwork-service

**Entities migrated:**
1. `ArtworkLike` - from `community_service.likes` WHERE `likeable_type = 'ARTWORK'`
2. `ArtworkComment` - from `community_service.comments` WHERE `commentable_type = 'ARTWORK'`

**Migration steps:**
1. Create new tables in artwork-service
2. Copy data with transformation
3. Update application code to use new service
4. Use feature flags for gradual rollout
5. Clean up old data after successful migration

**Benefits:**
- Better service autonomy - artwork-related features stay in artwork-service
- No cross-service polymorphism
- Easier to scale and maintain
- Clear ownership boundaries

---

## Key Principles

1. **No cross-service TypeORM relationships** - Use UUID references only
2. **Denormalize for performance** - Store `sellerId` in likes/comments for filtering
3. **Eventual consistency for counters** - Metrics updated asynchronously
4. **Same-service relationships OK** - TypeORM relationships within artwork-service are fine
5. **Explicit junction tables** - Better control than implicit `@ManyToMany` tables
