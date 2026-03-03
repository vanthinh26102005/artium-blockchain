# Community Service Entities

This document describes all entities in the community-service and their relationships.

## Entities Overview

### 1. Moment
**Purpose:** User-shared moments with media (Instagram Stories-like feature)

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `mediaUrl` - Media file URL (image or video)
- `mediaType` - IMAGE or VIDEO
- `thumbnailUrl` - Thumbnail for videos
- `caption` - Text caption
- `isPinned` - Pin to top of profile
- `isArchived` - Hide from feed
- `expiresAt` - Auto-expire timestamp (like Instagram stories)
- **Metrics (denormalized):**
  - `viewCount` - Total views (eventual consistency)
  - `likeCount` - Total likes (eventual consistency)
  - `commentCount` - Total comments (eventual consistency)
- `location` - Location tag
- `hashtags` - Hashtag array (JSONB)
- `durationSeconds` - Video duration

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ Artwork[]** (Cross-service): Via MomentTaggedArtwork junction table
- **← Like[]** (One-to-Many): Likes on this moment (via polymorphic relationship)
- **← Comment[]** (One-to-Many): Comments on this moment (via polymorphic relationship)
- **← MomentView[]** (One-to-Many): View tracking

**Indexes:**
- Composite: `(userId, createdAt)`, `(isArchived, expiresAt)`
- Single: `createdAt`

**Note:** `taggedArtworkIds` JSON array was removed - now use `MomentTaggedArtwork` junction table

---

### 2. MomentTaggedArtwork
**Purpose:** Junction table linking moments to tagged artworks

**Fields:**
- `momentId` (PK) - Reference to Moment (same service)
- `artworkId` (PK) - Reference to artwork-service Artwork
- `displayOrder` - Sort order for multiple artworks
- `createdAt` - When artwork was tagged

**Relationships:**
- **→ Moment** (Same-service): Via `momentId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference

**Indexes:**
- Unique: `(momentId, artworkId)`
- Composite: `(momentId, displayOrder)`
- Single: `artworkId`

**Migration Note:**
- Replaces `Moment.taggedArtworkIds` JSON array
- Better queryability - can find all moments featuring an artwork

---

### 3. Moodboard
**Purpose:** User-curated collections of artworks (Pinterest-like)

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User (owner)
- `title` - Moodboard title
- `description` - Moodboard description
- `coverImageUrl` - Cover image
- `isPrivate` - Privacy status
- **Metrics:**
  - `artworkCount` - Number of artworks (strong consistency)
  - `likeCount` - Total likes (eventual consistency)
  - `viewCount` - Total views (eventual consistency)
  - `shareCount` - Total shares (eventual consistency)
- `isCollaborative` - Collaborative status
- `tags` - Organization tags (JSONB)
- `displayOrder` - Sort order in user's moodboards

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ Artwork[]** (Cross-service): Via MoodboardArtwork junction table
- **→ User[]** (Cross-service): Collaborators via MoodboardCollaborator junction table
- **← Like[]** (One-to-Many): Likes on this moodboard
- **← Comment[]** (One-to-Many): Comments on this moodboard

**Indexes:**
- Composite: `(userId, isPrivate)`, `(userId, createdAt)`

**Note:** `collaboratorIds` JSON array was removed - now use `MoodboardCollaborator` junction table

---

### 4. MoodboardArtwork
**Purpose:** Junction table linking moodboards to artworks

**Fields:**
- `moodboardId` (PK) - Reference to Moodboard (same service)
- `artworkId` (PK) - Reference to artwork-service Artwork
- `displayOrder` - Sort order in moodboard
- `notes` - User's personal notes about artwork
- `tags` - Custom tags for organization (JSONB)
- `isFavorite` - Favorite within moodboard
- **Minimal caching:**
  - `artworkTitle` - For search/display (refreshable)
  - `artworkImageUrl` - For grid display (refreshable)
  - `artworkSellerId` - For filtering (denormalized)
- `createdAt` - When added to moodboard

**Relationships:**
- **→ Moodboard** (Same-service): Via `moodboardId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference

**Indexes:**
- Unique: `(moodboardId, artworkId)`
- Composite: `(moodboardId, displayOrder)`
- Single: `artworkId`

**Caching Strategy:**
- Only cache minimal data for performance
- Fetch full artwork details from artwork-service when needed
- Cached fields are refreshable (can be updated on daily sync)

---

### 5. MoodboardCollaborator
**Purpose:** Junction table for collaborative moodboards with permissions

**Fields:**
- `moodboardId` (PK) - Reference to Moodboard (same service)
- `userId` (PK) - Reference to identity-service User (collaborator)
- `role` - Collaborator role (EDITOR, VIEWER)
- `canEdit` - Permission to add/remove artworks
- `canInvite` - Permission to invite others
- `invitedAt` - When user was invited
- `invitedBy` - Reference to identity-service User (who sent invite)
- `createdAt` - Timestamp

**Relationships:**
- **→ Moodboard** (Same-service): Via `moodboardId`
- **→ User** (Cross-service): Via `userId` and `invitedBy` UUID references

**Indexes:**
- Unique: `(moodboardId, userId)`
- Single: `userId`

**Migration Note:**
- Replaces `Moodboard.collaboratorIds` JSON array
- Supports role-based permissions
- Can track who invited whom

---

### 6. Like
**Purpose:** Universal like system for community-owned entities (polymorphic)

**Polymorphic Types:**
- `MOMENT` - Like on a moment
- `MOODBOARD` - Like on a moodboard
- `COMMENT` - Like on a comment
- `TESTIMONIAL` - Like on a testimonial

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `likeableType` - Type of entity (enum above)
- `likeableId` - ID of liked entity
- `contentOwnerId` - Reference to identity-service User (for notifications)
- `createdAt` - When like was created

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ {Entity}** (Polymorphic, same-service): Via `likeableId` based on `likeableType`

**Indexes:**
- Unique: `(userId, likeableType, likeableId)` - User can only like once
- Composite: `(likeableType, likeableId, createdAt)`, `(userId, createdAt)`

**Migration Note:**
- **ARTWORK removed** from `LikeableType` enum
- Artwork likes moved to artwork-service for better service autonomy
- Only handles likes for entities owned by community-service

---

### 7. Comment
**Purpose:** Universal comment system for community-owned entities (polymorphic)

**Polymorphic Types:**
- `MOMENT` - Comment on a moment
- `MOODBOARD` - Comment on a moodboard
- `TESTIMONIAL` - Comment on a testimonial

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `commentableType` - Type of entity (enum above)
- `commentableId` - ID of commented entity
- `parentCommentId` - Reference to parent comment (for nested replies)
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
- `contentOwnerId` - Reference to identity-service User (for notifications)
- `createdAt`, `updatedAt` - Timestamps

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ {Entity}** (Polymorphic, same-service): Via `commentableId` based on `commentableType`
- **→ Comment** (Self-reference): Via `parentCommentId` for nested replies
- **← Like[]** (One-to-Many): Likes on this comment

**Indexes:**
- Composite: `(commentableType, commentableId, createdAt)`, `(userId, createdAt)`
- Single: `parentCommentId`

**Migration Note:**
- **ARTWORK removed** from `CommentableType` enum
- Artwork comments moved to artwork-service
- Supports nested replies via `parentCommentId`

---

### 8. Follower
**Purpose:** Follow relationships between users

**Fields:**
- `followingUserId` (PK) - Reference to identity-service User (follower)
- `followedUserId` (PK) - Reference to identity-service User (being followed)
- `isMutual` - Mutual follow status
- `notifyOnPosts` - Notification preference for posts
- `notifyOnEvents` - Notification preference for events
- `followSource` - How follow originated (e.g., "SUGGESTED", "SEARCH")
- `createdAt` - When follow was created

**Relationships:**
- **→ User** (Cross-service): Via `followingUserId` and `followedUserId` UUID references

**Indexes:**
- Unique: `(followingUserId, followedUserId)`
- Composite: `(followedUserId, createdAt)`, `(followingUserId, createdAt)`

**Query Examples:**
- Get followers of user X: WHERE `followedUserId = X`
- Get users that user X follows: WHERE `followingUserId = X`
- Check if mutual: WHERE `isMutual = true`

---

### 9. Testimonial
**Purpose:** Seller reviews and ratings

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `reviewerId` - Reference to identity-service User
- `rating` - Star rating (1-5)
- `title` - Review title
- `content` - Review text
- Additional metadata fields

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **→ User** (Cross-service): Via `reviewerId` UUID reference
- **← Like[]** (One-to-Many): Likes on testimonial
- **← Comment[]** (One-to-Many): Comments on testimonial

---

### 10. MomentView
**Purpose:** Tracking who viewed which moments

**Fields:**
- `id` (PK) - Unique identifier
- `momentId` - Reference to Moment (same service)
- `userId` - Reference to identity-service User (viewer)
- `viewedAt` - When viewed

**Relationships:**
- **→ Moment** (Same-service): Via `momentId`
- **→ User** (Cross-service): Via `userId` UUID reference

---

### 11. ActivityFeed
**Purpose:** User activity timeline

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `activityType` - Type of activity
- `entityType` - Type of related entity
- `entityId` - ID of related entity
- Additional metadata fields

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | User | `userId` | Content creator/actor |
| identity-service | SellerProfile | `sellerId` | Testimonial subject |
| artwork-service | Artwork | `artworkId` | Tagged/collected artwork |

**This service is referenced by:**
- No external services reference community-service entities
- Community features are self-contained

---

## Migration Strategy

### Removed Cross-Service Polymorphism

**Before:**
- `Like` supported `ARTWORK` type → artwork-service
- `Comment` supported `ARTWORK` type → artwork-service

**After:**
- Artwork likes/comments moved to artwork-service
- `ArtworkLike` and `ArtworkComment` entities created
- Community-service only handles community-owned entities

**Benefits:**
- Better service autonomy
- No cross-service polymorphic relationships
- Clearer ownership boundaries
- Easier to scale each service independently

### Replaced JSON Arrays with Junction Tables

**Before:**
- `Moment.taggedArtworkIds` - JSON array
- `Moodboard.collaboratorIds` - JSON array

**After:**
- `MomentTaggedArtwork` - explicit junction table
- `MoodboardCollaborator` - explicit junction table with permissions

**Benefits:**
- Better queryability - can find moments featuring artwork X
- Foreign key constraints possible
- Can add metadata (displayOrder, permissions, timestamps)
- Better indexing and performance

---

## Key Principles

1. **Service boundaries** - Only handle community-owned entities
2. **No cross-service polymorphism** - Polymorphic relationships stay within service
3. **Explicit junction tables** - Better than JSON arrays for relational data
4. **Eventual consistency for metrics** - Counters updated asynchronously
5. **Cross-service references via UUIDs** - No TypeORM relationships across services
6. **Same-service relationships OK** - TypeORM relationships within community-service are fine
