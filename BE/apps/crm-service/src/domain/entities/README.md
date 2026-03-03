# CRM Service Entities

This document describes all entities in the crm-service and their relationships.

## Entities Overview

### 1. Contact
**Purpose:** Customer relationship management - seller's contact database

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile (contact owner)
- **Personal Information:**
  - `email` - Email address (unique per seller)
  - `firstName` - First name
  - `lastName` - Last name
  - `phone` - Phone number
  - `company` - Company name
  - `jobTitle` - Job title
  - `address` - Physical address (JSONB)
- **Status & Source:**
  - `status` - Contact status (ACTIVE, UNSUBSCRIBED, BOUNCED, COMPLAINED)
  - `source` - How contact was acquired (MANUAL_IMPORT, EVENT_REGISTRATION, PURCHASE, etc.)
- **Communication Preferences:**
  - `optInEmail` - Email opt-in status
  - `optInSms` - SMS opt-in status
- **Segmentation:**
  - `tags` - Freeform tags (JSONB array)
  - `customerSegmentIds` - Assigned segments (JSONB array)
- **Engagement Metrics:**
  - `emailOpens` - Total email opens
  - `emailClicks` - Total email clicks
  - `lastEmailSentAt` - Last email sent
  - `lastEmailOpenedAt` - Last email opened
  - `engagementScore` - Calculated score 0-100
- **Purchase History:**
  - `totalPurchases` - Total purchase count
  - `totalSpent` - Total amount spent
  - `lastPurchaseAt` - Last purchase date
- **Additional:**
  - `notes` - Internal notes
  - `customFields` - Custom data (JSONB)
  - `unsubscribedAt` - Unsubscribe timestamp

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **Referenced by:** PrivateViewInvitee (contactId)

**Indexes:**
- Unique: `(sellerId, email)` - One email per seller
- Composite: `(sellerId, status)`
- Single: `email`

**Business Logic:**
- Contacts are scoped to sellers - each seller has their own contact database
- Engagement score calculated based on opens, clicks, purchases
- GDPR compliant - tracks consent and allows unsubscribe

---

### 2. PrivateView
**Purpose:** Exclusive preview links for VIP clients to view curated artworks

**Fields:**
- `viewId` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `title` - View title
- `description` - View description
- **Access Control:**
  - `accessToken` - Unique secure token for URL (unique)
  - `passwordHash` - Optional password (encrypted)
  - `isPasswordProtected` - Password protection flag
  - `expiresAt` - Expiration date
  - `maxViews` - Maximum view count limit
  - `currentViews` - Current view count
- **Media:**
  - `coverImageUrl` - Cover image
- **View Settings:**
  - `showPrices` - Whether to show prices
  - `allowInquiries` - Allow artwork inquiries
  - `allowPurchases` - Allow direct purchases
  - `welcomeMessage` - Custom welcome text
- **Status:**
  - `isActive` - Active status
- **Analytics:**
  - `uniqueVisitors` - Unique visitor count
  - `inquiryCount` - Total inquiries
  - `purchaseCount` - Total purchases
  - `totalRevenue` - Revenue generated
- `notes` - Internal notes

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **→ PrivateViewInvitee[]** (One-to-Many): Invited contacts/guests
- **← PrivateViewArtwork[]** (One-to-Many): Artworks in view

**Indexes:**
- Unique: `accessToken`
- Composite: `(sellerId, expiresAt)`

**URL Format:** `https://app.com/private-view/{accessToken}`

**Migration Note:**
- Removed `invitedContactIds` and `invitedEmails` JSON arrays
- Now uses `PrivateViewInvitee` junction table

---

### 3. PrivateViewInvitee
**Purpose:** Junction table tracking who was invited to private views

**Fields:**
- `viewId` (PK) - Reference to PrivateView (same service)
- `contactId` (PK, nullable) - Reference to Contact (same service)
- `email` - Email for non-contact guests
- `hasViewed` - Whether invitee viewed
- `viewedAt` - When viewed
- `invitedAt` - When invited

**Relationships:**
- **→ PrivateView** (Same-service): Via `viewId`
- **→ Contact** (Same-service): Via `contactId` (nullable for guest invites)

**Indexes:**
- Unique: `(viewId, contactId)` WHERE `contactId IS NOT NULL`
- Unique: `(viewId, email)` WHERE `email IS NOT NULL`

**Usage:**
- Supports both registered contacts and guest emails
- Tracks which invitees actually viewed the private view
- For analytics and follow-up

---

### 4. PrivateViewArtwork
**Purpose:** Junction table linking artworks to private views

**Fields:**
- `viewId` (PK) - Reference to PrivateView (same service)
- `artworkId` (PK) - Reference to artwork-service Artwork
- `displayOrder` - Sort order
- `isFeatured` - Featured artwork flag
- `customPrice` - Custom price for this view (optional)
- `customDescription` - Custom description for this view
- Additional metadata

**Relationships:**
- **→ PrivateView** (Same-service): Via `viewId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference

**Note:** Allows sellers to customize artwork presentation per private view

---

### 5. Promotion
**Purpose:** Promotional campaigns and discount codes

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `name` - Promotion name
- `code` - Promo code (e.g., "SUMMER2025")
- `description` - Promotion description
- **Discount:**
  - `discountType` - Type (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING)
  - `discountValue` - Discount value
  - `minPurchaseAmount` - Minimum purchase requirement
  - `maxDiscountAmount` - Maximum discount cap
- **Validity:**
  - `startsAt` - Start date
  - `expiresAt` - End date
  - `maxUses` - Maximum total uses
  - `usesPerCustomer` - Uses per customer limit
  - `currentUses` - Current usage count
- **Scope:**
  - `applicableArtworkIds` - Specific artworks (JSONB array)
  - `applicableCategories` - Applicable categories (JSONB array)
- `isActive` - Active status

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference

---

### 6. EmailCampaign
**Purpose:** Email marketing campaigns

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `name` - Campaign name
- `subject` - Email subject line
- `content` - Email HTML content
- `status` - Campaign status (DRAFT, SCHEDULED, SENDING, SENT, CANCELLED)
- `scheduledAt` - Scheduled send time
- `sentAt` - Actual send time
- **Targeting:**
  - `recipientSegmentIds` - Target segments (JSONB array)
  - `recipientContactIds` - Specific contacts (JSONB array)
- **Metrics:**
  - `totalRecipients` - Total recipients
  - `sentCount` - Successfully sent
  - `openCount` - Total opens
  - `clickCount` - Total clicks
  - `bounceCount` - Bounced emails
  - `unsubscribeCount` - Unsubscribes
- `templateId` - Email template used

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **← CampaignRecipient[]** (One-to-Many): Individual recipients

---

### 7. CampaignRecipient
**Purpose:** Tracks individual campaign delivery and engagement

**Fields:**
- `id` (PK) - Unique identifier
- `campaignId` - Reference to EmailCampaign (same service)
- `contactId` - Reference to Contact (same service)
- `email` - Recipient email
- `status` - Delivery status (PENDING, SENT, FAILED, BOUNCED)
- **Engagement:**
  - `openedAt` - First open timestamp
  - `openCount` - Total opens
  - `clickedAt` - First click timestamp
  - `clickCount` - Total clicks
- `sentAt` - Sent timestamp
- `failureReason` - Failure reason if failed

**Relationships:**
- **→ EmailCampaign** (Same-service): Via `campaignId`
- **→ Contact** (Same-service): Via `contactId`

---

### 8. CustomerSegment
**Purpose:** Contact segmentation for targeted campaigns

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `name` - Segment name
- `description` - Segment description
- **Criteria (JSONB):**
  - `filters` - Dynamic filter conditions
  - Examples:
    - Purchase history (total spent > $1000)
    - Engagement score > 70
    - Last purchase within 30 days
    - Specific tags
- `contactCount` - Cached contact count
- `isStatic` - Static vs dynamic segment
- `lastRefreshedAt` - Last criteria evaluation

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference

**Usage:**
- Dynamic segments automatically update based on criteria
- Static segments have fixed membership
- Used for targeted email campaigns and analytics

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | SellerProfile | `sellerId` | CRM owner |
| artwork-service | Artwork | `artworkId` | Private view artworks |

**This service is referenced by:**
- No external services currently reference CRM entities

---

## Private View Flow

### Creating a Private View

```typescript
// 1. Create private view
const privateView = await createPrivateView({
  sellerId: seller.id,
  title: "Exclusive Spring Collection",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  isPasswordProtected: true,
  showPrices: false,
  allowInquiries: true
});

// 2. Add artworks
const artworks = await artworkClient.getArtworksBySeller(sellerId);
for (const artwork of selectedArtworks) {
  await addArtworkToPrivateView({
    viewId: privateView.viewId,
    artworkId: artwork.id,
    displayOrder: index
  });
}

// 3. Invite contacts
const vipContacts = await getContactsBySegment("VIP_COLLECTORS");
for (const contact of vipContacts) {
  await inviteToPrivateView({
    viewId: privateView.viewId,
    contactId: contact.id
  });
}

// 4. Send invitation emails
await sendPrivateViewInvitations(privateView.viewId);
```

### Accessing Private View

```typescript
// 1. User visits URL: /private-view/{accessToken}
const view = await getPrivateViewByToken(accessToken);

// 2. Check access
if (view.isPasswordProtected) {
  // Prompt for password
  const valid = await verifyPassword(password, view.passwordHash);
  if (!valid) throw new UnauthorizedError();
}

// 3. Check expiration
if (view.expiresAt && new Date() > view.expiresAt) {
  throw new ExpiredError();
}

// 4. Check view limit
if (view.maxViews && view.currentViews >= view.maxViews) {
  throw new LimitReachedError();
}

// 5. Track view
await incrementViewCount(view.viewId);
if (inviteeId) {
  await markInviteeAsViewed(view.viewId, inviteeId);
}

// 6. Load artworks
const artworks = await loadPrivateViewArtworks(view.viewId);
```

---

## Contact Management Best Practices

### Engagement Score Calculation

```typescript
function calculateEngagementScore(contact: Contact): number {
  let score = 0;

  // Email engagement (40 points max)
  score += Math.min(contact.emailOpens * 2, 20);
  score += Math.min(contact.emailClicks * 4, 20);

  // Purchase history (40 points max)
  score += Math.min(contact.totalPurchases * 10, 30);
  if (contact.lastPurchaseAt) {
    const daysSince = getDaysSince(contact.lastPurchaseAt);
    if (daysSince < 30) score += 10;
    else if (daysSince < 90) score += 5;
  }

  // Recency (20 points max)
  if (contact.lastEmailOpenedAt) {
    const daysSince = getDaysSince(contact.lastEmailOpenedAt);
    if (daysSince < 7) score += 20;
    else if (daysSince < 30) score += 10;
    else if (daysSince < 90) score += 5;
  }

  return Math.min(score, 100);
}
```

### GDPR Compliance

1. **Consent Tracking:**
   - `optInEmail` and `optInSms` track explicit consent
   - `source` tracks how contact was acquired

2. **Right to be Forgotten:**
   - Delete contact completely
   - Or anonymize: set email to "deleted+{id}@example.com", clear personal data

3. **Data Export:**
   - Provide all contact data on request
   - Include purchase history, engagement data

4. **Unsubscribe:**
   - Update `status` to UNSUBSCRIBED
   - Set `unsubscribedAt` timestamp
   - Automatically exclude from campaigns

---

## Key Principles

1. **Seller-scoped data** - All CRM data belongs to specific seller
2. **Explicit invitations** - Junction table for private view invitees
3. **GDPR compliance** - Track consent, allow unsubscribe, support data export
4. **Engagement tracking** - Detailed metrics for email campaigns
5. **Flexible segmentation** - Dynamic and static customer segments
6. **Privacy-first** - Secure private views with tokens, passwords, expiration
