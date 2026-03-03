# Messaging Service Database Seeds

This directory contains database seeding scripts for the Messaging Service.

## Overview

The seeding system creates realistic test data for:
- **Conversations**: Direct, group, and inquiry conversations
- **Messages**: Text, image, and file messages with reactions
- **Participants**: Conversation members with read status
- **Read Receipts**: Message read tracking

## Files

### `messaging.seed.ts`
Main seeder class that creates all messaging data:
- 50 direct conversations (1-on-1)
- 15 group conversations (3-8 members)
- 10 inquiry conversations (buyer-seller)
- Realistic messages with varied content
- Message reactions (emojis)
- Read receipts for message tracking

### `run-seeds.ts`
Entry point script that:
- Configures database connection (SHARED or ISOLATED mode)
- Fetches user IDs from Identity Service
- Runs the messaging seeder
- Provides progress feedback

### `seeder.module.ts` & `seeder.service.ts`
NestJS module structure for potential runtime seeding integration.

## Prerequisites

**IMPORTANT**: The Identity Service must be seeded first, as messaging data depends on user IDs.

```bash
# 1. Seed Identity Service first
cd BE/apps/identity-service
npm run seed

# 2. Then seed Messaging Service
cd BE/apps/messaging-service
npm run seed
```

## Usage

### Development (Recommended)

Using npm script (defined in package.json):

```bash
cd BE/apps/messaging-service
npm run seed
```

### Direct Execution

Using ts-node directly:

```bash
cd BE/apps/messaging-service
npx ts-node src/db/seeds/run-seeds.ts
```

## Database Strategies

### SHARED Mode (Default)
All services use the same database with different schemas:
- Database: `artium_global`
- Schema: `messaging`
- User IDs fetched from `identity` schema

```bash
export DB_STRATEGY=SHARED
npm run seed
```

### ISOLATED Mode
Each service has its own database:
- Database: `messaging_db`
- User IDs fetched from `identity_db`

```bash
export DB_STRATEGY=ISOLATED
npm run seed
```

## Environment Variables

### SHARED Mode
```env
DB_STRATEGY=SHARED
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5454
SHARED_DB_USERNAME=postgres
SHARED_DB_PASSWORD=your_password
SHARED_DB_NAME=artium_global
```

### ISOLATED Mode
```env
DB_STRATEGY=ISOLATED
DB_HOST=localhost
DB_PORT=5438
DB_USER=messaging_user
DB_PASS=your_password
DB_NAME=messaging_db

# Identity Service connection (for fetching user IDs)
IDENTITY_DB_HOST=localhost
IDENTITY_DB_PORT=5437
IDENTITY_DB_USER=identity_user
IDENTITY_DB_PASS=your_password
IDENTITY_DB_NAME=identity_db
```

## Generated Data

### Conversations (75 total)

**Direct Conversations (50)**
- Between 2 users
- Personal 1-on-1 chats
- 10% archived
- Message count: 1-50 per conversation

**Group Conversations (15)**
- 3-8 members per group
- Named groups (e.g., "Art Collectors United", "Gallery Discussion")
- Group descriptions
- Message count: 10-200 per conversation

**Inquiry Conversations (10)**
- Collector to seller inquiries
- Related to artworks
- Topics: pricing, shipping, commissions, etc.
- Message count: 3-20 per conversation

### Messages

**Content Types:**
- Text messages (85%)
- Image messages (10%) - with Picsum placeholder URLs
- File messages (5%) - PDF documents

**Features:**
- 5% edited messages (with editedAt timestamp)
- 2% deleted messages (soft delete)
- 30% have reactions (emoji reactions)
- Realistic conversation flow
- Varied message templates

**Message Templates:**
- Greetings: "Hello! How are you?", "Hi there! 👋"
- Artwork inquiries: "Is this still available?"
- Price negotiations: "Would you consider a lower price?"
- Shipping questions: "How long would shipping take?"
- Responses: "Thank you for your inquiry!"
- Casual: "That sounds great!", "I completely agree."

**Reactions:**
- Emojis: 👍 ❤️ 😊 🎨 ✨ 🔥 👏 🙌
- Multiple users can react to same message
- Reaction timestamps

### Participants

- All conversation members are participants
- 95% active participants
- 70% have read receipts
- Join dates match conversation creation
- Last read timestamps (recent activity)

### Read Receipts

- 70% of messages are read
- Tracked per user per message
- Excludes sender (can't read own message)
- Used for "seen" indicators

## Data Relationships

```
Conversation (1) ←→ (N) ConversationParticipant
     ↓
     (1) ←→ (N) Message
                   ↓
                   (1) ←→ (N) ReadReceipt
```

## Seeding Flow

1. **Clear existing data** (in correct order due to foreign keys)
   - Read receipts
   - Messages
   - Conversation participants
   - Conversations

2. **Create conversations** with metadata
   - Type, name, creator, timestamps
   - Message counts, last message info

3. **Create participants** for each conversation
   - Direct: 2 users
   - Group: 3-8 users
   - Inquiry: buyer + seller

4. **Create messages** with content
   - Varied message types
   - Realistic timestamps
   - Reactions on 30% of messages
   - Edit/delete flags

5. **Create read receipts** for tracking
   - 70% read rate
   - Realistic read times

6. **Update conversation metadata**
   - Last message content
   - Last message sender
   - Last message timestamp

## Example Output

```
🌱 Starting Messaging Service seeding...
✅ Cleared existing data

💬 Creating conversations...
  Creating direct conversations...
  Creating group conversations...
  Creating inquiry conversations...
✅ Created 75 conversations

👥 Creating conversation participants...
✅ Created 287 conversation participants

📧 Creating messages...
✅ Created 1,843 messages
✅ Updated conversation metadata
✅ Created 1,290 read receipts

✨ Messaging Service Seeding Complete!
═══════════════════════════════════════
💬 Conversations:  75
   - Direct:       50
   - Group:        15
   - Inquiry:      10
👥 Participants:   287
📧 Messages:       1,843
✅ Read Receipts:  1,290
═══════════════════════════════════════
```

## Troubleshooting

### "No users found in Identity Service"
**Solution**: Seed Identity Service first:
```bash
cd BE/apps/identity-service
npm run seed
```

### "Cannot connect to database"
**Solution**: 
1. Check PostgreSQL is running
2. Verify environment variables
3. Check database exists (SHARED: artium_global, ISOLATED: messaging_db)

### "Schema not found"
**Solution**: The script auto-creates schemas in SHARED mode. If manual creation needed:
```sql
CREATE SCHEMA IF NOT EXISTS messaging;
```

### "Not enough users"
**Solution**: Identity Service needs at least 10 users. Re-seed identity service.

## Testing the Data

After seeding, verify data:

```sql
-- Check conversation counts
SELECT type, COUNT(*) FROM messaging.conversations GROUP BY type;

-- Check message distribution
SELECT conversation_id, COUNT(*) as message_count 
FROM messaging.messages 
GROUP BY conversation_id 
ORDER BY message_count DESC 
LIMIT 10;

-- Check read receipts
SELECT COUNT(*) as total_receipts FROM messaging.read_receipts;

-- Check reactions
SELECT COUNT(*) as messages_with_reactions 
FROM messaging.messages 
WHERE reactions IS NOT NULL;
```

## Integration with Application

The seeded data provides:
- ✅ Realistic conversation scenarios
- ✅ Various message types for testing UI
- ✅ Read receipts for testing indicators
- ✅ Reactions for testing emoji features
- ✅ Group conversations for testing multi-user features
- ✅ Inquiry conversations for testing buyer-seller flow

## Customization

### Adjust Data Volume

Edit `messaging.seed.ts`:

```typescript
// Line 60-65: Change conversation counts
for (let i = 0; i < 50; i++) // Change 50 to desired number
for (let i = 0; i < 15; i++) // Change 15 for groups
for (let i = 0; i < 10; i++) // Change 10 for inquiries

// Line 165: Change message count per conversation
const messageCount = Math.min(conversation.messageCount || 10, 50);
```

### Add Custom Message Templates

Edit `messaging.seed.ts` lines 136-176 to add your message templates.

### Modify Reaction Rate

Change line 228:
```typescript
if (Math.random() < 0.3) // 0.3 = 30% of messages have reactions
```

## Notes

- All timestamps are randomized within realistic ranges
- User pairs in direct conversations are unique (no duplicates)
- Group names are predefined for consistency
- Inquiry topics relate to common artwork purchase scenarios
- File URLs use placeholder paths (actual files not created)
- Image URLs use Picsum service for testing

## Related Documentation

- [Identity Service Seeds](../../identity-service/src/db/seeds/README.md)
- [Main Messaging Implementation](../../../../../MESSAGING_FINAL_SUMMARY.md)
- [Database Strategy Guide](../../../../docs/database-strategy.md)
