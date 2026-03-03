# Events Service Entities

This document describes all entities in the events-service and their relationships.

## Entities Overview

### 1. Event
**Purpose:** Art events with RSVP and attendance tracking (exhibitions, workshops, openings, etc.)

**Fields:**
- `eventId` (PK) - Unique identifier
- `creatorId` - Reference to identity-service SellerProfile (event organizer)
- **Basic Information:**
  - `title` - Event title
  - `description` - Event description
  - `type` - Event type (EXHIBITION, WORKSHOP, GALLERY_OPENING, ARTIST_TALK, AUCTION, etc.)
  - `status` - Event status (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
- **Timing:**
  - `startTime` - Event start time
  - `endTime` - Event end time
  - `timezone` - Timezone
- **Location (JSONB):**
  - `type` - PHYSICAL, VIRTUAL, or HYBRID
  - `venueName` - Venue name
  - `address` - Physical address
  - `coordinates` - Lat/long for maps
  - `virtualUrl` - Video conference link
  - `accessInstructions` - How to access
- **Media:**
  - `coverImageUrl` - Cover image
  - `galleryImages` - Image gallery (JSONB array)
- **Registration:**
  - `requiresRegistration` - Whether registration required
  - `maxAttendees` - Maximum capacity
  - `registrationDeadline` - Deadline to register
  - `attendeeCount` - Current attendee count (denormalized)
- **Privacy:**
  - `isPublic` - Public event flag
  - `inviteOnly` - Invite-only flag
  - `accessCode` - Access code for private events
- **Pricing:**
  - `isFree` - Free event flag
  - `ticketPrice` - Ticket price
  - `currency` - Currency code
- **Contact:**
  - `externalUrl` - External event website
  - `contactEmail` - Organizer email
  - `contactPhone` - Organizer phone
- **Metadata:**
  - `tags` - Event tags (JSONB array)
- **Cancellation:**
  - `cancellationReason` - Cancellation reason
  - `cancelledAt` - When cancelled
- `publishedAt` - When published

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `creatorId` UUID reference
- **← EventRsvp[]** (One-to-Many): RSVPs for this event
- **← EventAttendee[]** (One-to-Many): Attendees
- **← EventArtwork[]** (One-to-Many): Featured artworks

**Indexes:**
- Composite: `(creatorId, status)`, `(isPublic, status)`
- Single: `startTime`

**Event Types:**
- EXHIBITION - Art exhibition
- WORKSHOP - Educational workshop
- GALLERY_OPENING - Gallery opening
- ARTIST_TALK - Artist presentation
- AUCTION - Art auction
- PRIVATE_VIEWING - Private viewing
- FAIR - Art fair

---

### 2. EventRsvp
**Purpose:** RSVP tracking for events

**Fields:**
- `id` (PK) - Unique identifier
- `eventId` - Reference to Event (same service)
- `userId` - Reference to identity-service User
- `email` - Email for non-registered users
- **RSVP Status:**
  - `status` - CONFIRMED, DECLINED, MAYBE, WAITLISTED
  - `guestCount` - Number of guests (including RSVP holder)
- **Response:**
  - `dietaryRestrictions` - Dietary needs
  - `specialRequirements` - Accessibility/special needs
  - `notes` - Additional notes
- **Timestamps:**
  - `rsvpedAt` - When RSVP submitted
  - `updatedAt` - Last update

**Relationships:**
- **→ Event** (Same-service): Via `eventId`
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Unique: `(eventId, userId)` - One RSVP per user per event
- Composite: `(eventId, status)`

---

### 3. EventAttendee
**Purpose:** Actual attendance tracking (check-in at event)

**Fields:**
- `id` (PK) - Unique identifier
- `eventId` - Reference to Event (same service)
- `userId` - Reference to identity-service User (nullable)
- `email` - Email for walk-ins
- `name` - Attendee name
- **Check-in:**
  - `checkedInAt` - Check-in timestamp
  - `checkedInBy` - Who checked them in
- **Engagement:**
  - `artworksViewed` - Artwork IDs viewed (JSONB array)
  - `inquiriesMade` - Inquiry count
  - `purchasesMade` - Purchase count
- **Feedback:**
  - `rating` - Event rating (1-5)
  - `feedback` - Text feedback

**Relationships:**
- **→ Event** (Same-service): Via `eventId`
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Composite: `(eventId, checkedInAt)`
- Single: `userId`

**Note on artworksViewed:**
- Kept as JSONB array (not junction table)
- Tracking/analytics data, not relational
- Don't need to query "which attendees viewed artwork X"

---

### 4. EventArtwork
**Purpose:** Junction table linking events to featured artworks

**Fields:**
- `eventId` (PK) - Reference to Event (same service)
- `artworkId` (PK) - Reference to artwork-service Artwork
- `displayOrder` - Sort order for exhibition
- `isFeatured` - Featured artwork flag
- `customDescription` - Custom description for event context
- `forSale` - Whether available for purchase at event
- `eventPrice` - Special event price (optional)

**Relationships:**
- **→ Event** (Same-service): Via `eventId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference

**Indexes:**
- Unique: `(eventId, artworkId)`
- Composite: `(eventId, displayOrder)`
- Single: `artworkId`

**Usage:**
- Links artworks to exhibitions/events
- Allows custom pricing for events
- Controls display order in gallery

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | SellerProfile | `creatorId` | Event organizer |
| identity-service | User | `userId` | RSVP/attendee |
| artwork-service | Artwork | `artworkId` | Featured artwork |

**This service is referenced by:**

| Service | Entity | Field | Purpose |
|---------|--------|-------|---------|
| messaging-service | Conversation | `relatedEntityId` | Event chat conversations |

---

## Event Flows

### 1. Creating an Event

```typescript
// Step 1: Create event
const event = await createEvent({
  creatorId: seller.id,
  title: "Spring Exhibition 2025",
  description: "Featuring emerging artists...",
  type: EventType.EXHIBITION,
  status: EventStatus.DRAFT,
  startTime: new Date("2025-06-01T18:00:00"),
  endTime: new Date("2025-06-01T21:00:00"),
  location: {
    type: "PHYSICAL",
    venueName: "Modern Art Gallery",
    address: {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US"
    }
  },
  requiresRegistration: true,
  maxAttendees: 100
});

// Step 2: Add featured artworks
const artworks = await artworkClient.getArtworksBySeller(seller.id);
for (const artwork of selectedArtworks) {
  await addArtworkToEvent({
    eventId: event.eventId,
    artworkId: artwork.id,
    displayOrder: index,
    forSale: true
  });
}

// Step 3: Publish event
event.status = EventStatus.PUBLISHED;
event.publishedAt = new Date();

// Step 4: Notify followers
await notificationsClient.notifyFollowers(seller.id, {
  type: "NEW_EVENT",
  eventId: event.eventId
});
```

### 2. RSVP Flow

```typescript
// Step 1: User RSVPs
const rsvp = await createEventRsvp({
  eventId: event.eventId,
  userId: user.id,
  status: RSVPStatus.CONFIRMED,
  guestCount: 2,
  dietaryRestrictions: "Vegetarian",
  notes: "Looking forward to it!"
});

// Step 2: Check capacity
const currentCount = await getConfirmedRsvpCount(event.eventId);
if (currentCount >= event.maxAttendees) {
  rsvp.status = RSVPStatus.WAITLISTED;
}

// Step 3: Update event attendee count
event.attendeeCount = currentCount;

// Step 4: Send confirmation email
await notificationsClient.sendEmail({
  to: user.email,
  template: "EVENT_RSVP_CONFIRMATION",
  data: { event, rsvp }
});

// Step 5: Add to calendar
const calendarLink = generateCalendarLink(event);
```

### 3. Check-in Flow

```typescript
// At event entrance
// Step 1: Look up RSVP
const rsvp = await findRsvpByEmail(email);
if (!rsvp || rsvp.status !== RSVPStatus.CONFIRMED) {
  // Handle walk-in or declined RSVP
}

// Step 2: Create attendee record
const attendee = await checkInAttendee({
  eventId: event.eventId,
  userId: rsvp?.userId,
  email: email,
  name: name,
  checkedInAt: new Date(),
  checkedInBy: staffId
});

// Step 3: Provide event materials
// - Event program/catalog
// - Artist list
// - Floor plan
```

### 4. Engagement Tracking

```typescript
// When attendee views artwork at exhibition
await trackArtworkView({
  attendeeId: attendee.id,
  artworkId: artwork.id
});

// Update artworksViewed array
attendee.artworksViewed = [...attendee.artworksViewed, artwork.id];

// When attendee makes inquiry
await trackInquiry({
  attendeeId: attendee.id,
  artworkId: artwork.id
});
attendee.inquiriesMade++;

// When attendee makes purchase
await trackPurchase({
  attendeeId: attendee.id,
  artworkId: artwork.id,
  amount: artwork.price
});
attendee.purchasesMade++;

// Post-event feedback
attendee.rating = 5;
attendee.feedback = "Wonderful exhibition!";
```

---

## Event Types & Use Cases

### Physical Events
- Gallery exhibitions
- Artist talks
- Workshops
- Private viewings
- Auction events

**Features:**
- Physical address with map coordinates
- Venue capacity limits
- Check-in at door
- Physical catalog/materials

### Virtual Events
- Online exhibitions
- Virtual studio tours
- Webinars
- Live auctions

**Features:**
- Video conference link
- No capacity limits (or platform limits)
- Digital catalog
- Screen sharing

### Hybrid Events
- Gallery opening with live stream
- Panel discussion with virtual Q&A
- Exhibition with online component

**Features:**
- Both physical and virtual access
- Separate RSVP tracking
- Hybrid engagement metrics

---

## Privacy & Access Control

### Public Events
- Listed in public directory
- Anyone can RSVP
- No access code required

### Private Events
- Not in public directory
- Invite-only or access code required
- RSVP requires approval

### Invite-Only Events
```typescript
// Send invitations to specific contacts
const vipContacts = await crmClient.getContactsBySegment("VIP");
for (const contact of vipContacts) {
  await sendEventInvitation({
    eventId: event.eventId,
    email: contact.email,
    accessCode: generateUniqueCode()
  });
}
```

---

## Analytics & Reporting

### Event Performance Metrics

```typescript
const analytics = {
  rsvp: {
    total: await getRsvpCount(eventId),
    confirmed: await getRsvpCount(eventId, RSVPStatus.CONFIRMED),
    declined: await getRsvpCount(eventId, RSVPStatus.DECLINED),
    waitlisted: await getRsvpCount(eventId, RSVPStatus.WAITLISTED)
  },
  attendance: {
    checkedIn: await getAttendeeCount(eventId),
    attendanceRate: checkedIn / confirmed * 100,
    averageRating: await getAverageRating(eventId)
  },
  engagement: {
    totalArtworksViewed: await getTotalArtworkViews(eventId),
    inquiries: await getTotalInquiries(eventId),
    purchases: await getTotalPurchases(eventId),
    revenue: await getTotalRevenue(eventId)
  }
};
```

### Top Artworks by Engagement

```typescript
const topArtworks = await getTopArtworksByViews(eventId, limit: 10);
// Returns artworks sorted by view count from EventAttendee.artworksViewed
```

---

## Integration with Other Services

### Messaging Integration
- Event chat conversations (messaging-service)
- Attendee networking
- Q&A with artists

### CRM Integration
- Sync attendees to contact database
- Follow-up email campaigns
- Segment by event attendance

### Community Integration
- Share event moments (community-service)
- Event photo galleries
- Testimonials from attendees

---

## Key Principles

1. **Flexible event types** - Support physical, virtual, hybrid events
2. **Capacity management** - Enforce max attendees, waitlist support
3. **Engagement tracking** - Track artwork views, inquiries, purchases
4. **Privacy controls** - Public, private, invite-only events
5. **Real-time updates** - Event status, attendee count
6. **Post-event analytics** - Comprehensive performance metrics
7. **JSONB for arrays** - Event tags, gallery images, artworks viewed (tracking data)
