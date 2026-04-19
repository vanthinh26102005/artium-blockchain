import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Conversation,
  ConversationType,
} from '../../domain/entities/conversation.entity';
import { Message, MessageType } from '../../domain/entities/message.entity';
import { ConversationParticipant } from '../../domain/entities/conversation-participant.entity';
import { ReadReceipt } from '../../domain/entities/read-receipt.entity';

export class MessagingSeeder {
  async run(dataSource: DataSource, userIds: string[]): Promise<void> {
    console.log('🌱 Starting Messaging Service seeding...');

    if (!userIds || userIds.length < 10) {
      console.warn(
        '⚠️  Not enough users provided for messaging seed. Need at least 10 users.',
      );
      console.warn('⚠️  Skipping messaging seed...');
      return;
    }

    const conversationRepo = dataSource.getRepository(Conversation);
    const messageRepo = dataSource.getRepository(Message);
    const participantRepo = dataSource.getRepository(ConversationParticipant);
    const readReceiptRepo = dataSource.getRepository(ReadReceipt);

    // Clear existing data
    // Use TRUNCATE CASCADE to handle foreign key constraints
    console.log('🗑️  Clearing existing data...');

    // Get schema name if in SHARED mode
    const options = dataSource.options;

    const schema =
      'schema' in options ? options.schema : undefined;

    // Helper to safely truncate a table (skips if table doesn't exist)
    const safeTruncate = async (tableName: string) => {
      try {
        const qualifiedName = schema ? `"${schema}"."${tableName}"` : tableName;
        await dataSource.query(`TRUNCATE TABLE ${qualifiedName} CASCADE`);
      } catch (error: any) {
        // Ignore "relation does not exist" errors (42P01) - table will be created by synchronize
        if (error?.code !== '42P01') {
          throw error;
        }
      }
    };

    // Truncate tables in correct order (respecting foreign key constraints)
    await safeTruncate('read_receipts');
    await safeTruncate('typing_indicators');
    await safeTruncate('message_attachments');
    await safeTruncate('messages');
    await safeTruncate('conversation_participants');
    await safeTruncate('conversations');

    console.log('✅ Cleared existing data (or tables were empty)');

    // ============================================
    // 1. CREATE CONVERSATIONS
    // ============================================
    console.log('💬 Creating conversations...');

    const conversations: Conversation[] = [];
    const participants: ConversationParticipant[] = [];

    // Helper function to get random past date
    const getRandomPastDate = (daysAgo: number) => {
      const now = Date.now();
      const randomTime = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
      return new Date(now - randomTime);
    };

    // Helper function to shuffle array
    const shuffleArray = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Create 50 DIRECT conversations (between 2 users)
    console.log('  Creating direct conversations...');
    const usedPairs = new Set<string>();

    for (let i = 0; i < 50; i++) {
      let user1, user2, pairKey;
      let attempts = 0;

      // Find unique pair
      do {
        user1 = userIds[Math.floor(Math.random() * userIds.length)];
        user2 = userIds[Math.floor(Math.random() * userIds.length)];
        pairKey = [user1, user2].sort().join('-');
        attempts++;
      } while ((user1 === user2 || usedPairs.has(pairKey)) && attempts < 100);

      if (attempts >= 100) continue; // Skip if can't find unique pair
      usedPairs.add(pairKey);

      const conversation = conversationRepo.create();
      conversation.type = ConversationType.DIRECT;
      conversation.isGroup = false;
      conversation.createdBy = user1;
      conversation.messageCount = Math.floor(Math.random() * 50) + 1;
      conversation.isActive = true;
      conversation.isArchived = i % 10 === 0; // 10% archived

      conversations.push(conversation);
    }

    // Create 15 GROUP conversations (3-8 users)
    console.log('  Creating group conversations...');
    const groupNames = [
      'Art Collectors United',
      'Gallery Discussion',
      'Contemporary Art Lovers',
      'Exhibition Planning',
      'Artwork Recommendations',
      'Art Investment Group',
      'Modern Artists Circle',
      'Sculpture Enthusiasts',
      'Abstract Art Community',
      'Photography Collective',
      'Digital Art Hub',
      'Fine Art Society',
      'Art Market Insights',
      'Curator Network',
      'Artist Collaboration',
    ];

    for (let i = 0; i < 15; i++) {
      const numMembers = Math.floor(Math.random() * 6) + 3; // 3-8 members
      const creatorId = userIds[Math.floor(Math.random() * userIds.length)];

      const conversation = conversationRepo.create();
      conversation.name = groupNames[i];
      conversation.type = ConversationType.GROUP;
      conversation.isGroup = true;
      conversation.createdBy = creatorId;
      conversation.description = `A group for discussing ${groupNames[i].toLowerCase()}`;
      conversation.messageCount = Math.floor(Math.random() * 200) + 10;
      conversation.isActive = true;
      conversation.isArchived = false;

      conversations.push(conversation);
    }

    // Create 10 INQUIRY conversations (collector to seller)
    console.log('  Creating inquiry conversations...');
    const inquiryTopics = [
      'Artwork Purchase Inquiry',
      'Price Negotiation',
      'Shipping Information',
      'Custom Commission Request',
      'Artwork Authentication',
      'Exhibition Details',
      'Bulk Purchase Inquiry',
      'Payment Options',
      'Artwork Condition',
      'Certificate of Authenticity',
    ];

    for (let i = 0; i < 10; i++) {
      const creatorId = userIds[Math.floor(Math.random() * userIds.length)];
      const sellerId = userIds[Math.floor(Math.random() * userIds.length)];

      const conversation = conversationRepo.create();
      conversation.name = inquiryTopics[i];
      conversation.type = ConversationType.INQUIRY;
      conversation.isGroup = false;
      conversation.createdBy = creatorId;
      conversation.relatedEntityType = 'artwork';
      conversation.relatedEntityId = `artwork-${i + 1}`;
      conversation.messageCount = Math.floor(Math.random() * 20) + 3;
      conversation.isActive = true;
      conversation.isArchived = false;

      conversations.push(conversation);
    }

    await conversationRepo.save(conversations);
    console.log(`✅ Created ${conversations.length} conversations`);

    // ============================================
    // 2. CREATE CONVERSATION PARTICIPANTS
    // ============================================
    console.log('👥 Creating conversation participants...');

    for (const conversation of conversations) {
      if (
        conversation.type === ConversationType.DIRECT ||
        conversation.type === ConversationType.INQUIRY
      ) {
        // Direct/Inquiry: 2 participants
        const participantIds = shuffleArray(userIds).slice(0, 2);

        for (const userId of participantIds) {
          const participant = participantRepo.create({
            conversationId: conversation.id,
            userId: userId,
          });
          participants.push(participant);
        }
      } else if (conversation.type === ConversationType.GROUP) {
        // Group: 3-8 participants
        const numMembers = Math.floor(Math.random() * 6) + 3;
        const participantIds = shuffleArray(userIds).slice(0, numMembers);

        for (const userId of participantIds) {
          const participant = participantRepo.create();
          participant.conversationId = conversation.id;
          participant.userId = userId;
          participants.push(participant);
        }
      }
    }

    await participantRepo.save(participants);
    console.log(`✅ Created ${participants.length} conversation participants`);

    // ============================================
    // 3. CREATE MESSAGES
    // ============================================
    console.log('📧 Creating messages...');

    const messages: Message[] = [];
    const readReceipts: ReadReceipt[] = [];

    // Message templates
    const messageTemplates = {
      greetings: [
        'Hello! How are you?',
        'Hi there! 👋',
        'Good morning!',
        'Hey! How have you been?',
        'Greetings!',
      ],
      artworkInquiry: [
        "I'm interested in this artwork. Is it still available?",
        'Could you tell me more about this piece?',
        "What's the story behind this artwork?",
        'Is this piece part of a series?',
        'Can you share more details about the materials used?',
      ],
      priceNegotiation: [
        'Would you consider a lower price?',
        "What's your best offer?",
        'Is there any discount available?',
        'Could we discuss the pricing?',
        "I'm very interested. Can we negotiate?",
      ],
      shipping: [
        'How long would shipping take?',
        'Do you offer international shipping?',
        'What are the shipping costs?',
        'Is the artwork properly insured during shipping?',
        'Can you provide tracking information?',
      ],
      responses: [
        'Thank you for your inquiry!',
        "Yes, it's still available.",
        "I'd be happy to discuss that.",
        'Let me check on that for you.',
        "That's a great question!",
        'I appreciate your interest.',
        'Sure, I can help with that.',
        'Absolutely! Let me explain...',
      ],
      casual: [
        'That sounds great!',
        'I completely agree.',
        'Interesting perspective!',
        'Thanks for sharing!',
        'That makes sense.',
        "I'll get back to you on that.",
        'Looking forward to it!',
        'Perfect! 🎨',
        'Sounds good to me.',
        'Let me know what you think.',
      ],
      reactions: ['👍', '❤️', '😊', '🎨', '✨', '🔥', '👏', '🙌'],
    };

    // Create messages for each conversation
    for (const conversation of conversations) {
      const conversationParticipants = participants.filter(
        (p) => p.conversationId === conversation.id,
      );
      const participantUserIds = conversationParticipants.map((p) => p.userId);

      if (participantUserIds.length === 0) continue;

      const messageCount = Math.min(conversation.messageCount || 10, 50); // Limit to 50 messages per conversation

      for (let i = 0; i < messageCount; i++) {
        const senderId =
          participantUserIds[
          Math.floor(Math.random() * participantUserIds.length)
          ];

        let content: string;
        let messageType = MessageType.TEXT;
        let mediaUrl: string | null = null;

        // Determine message content based on conversation type and position
        if (i === 0) {
          content =
            messageTemplates.greetings[
            Math.floor(Math.random() * messageTemplates.greetings.length)
            ];
        } else if (conversation.type === ConversationType.INQUIRY) {
          if (i % 2 === 0) {
            const inquiryType = Math.floor(Math.random() * 3);
            if (inquiryType === 0) {
              content =
                messageTemplates.artworkInquiry[
                Math.floor(
                  Math.random() * messageTemplates.artworkInquiry.length,
                )
                ];
            } else if (inquiryType === 1) {
              content =
                messageTemplates.priceNegotiation[
                Math.floor(
                  Math.random() * messageTemplates.priceNegotiation.length,
                )
                ];
            } else {
              content =
                messageTemplates.shipping[
                Math.floor(Math.random() * messageTemplates.shipping.length)
                ];
            }
          } else {
            content =
              messageTemplates.responses[
              Math.floor(Math.random() * messageTemplates.responses.length)
              ];
          }
        } else {
          content =
            messageTemplates.casual[
            Math.floor(Math.random() * messageTemplates.casual.length)
            ];
        }

        // 10% chance of image message
        if (Math.random() < 0.1) {
          messageType = MessageType.IMAGE;
          const artPhotoIds = ['1531056416665-266c4099c928', '1579783902915-f0b0de2c2eb3', '1541961017774-22349e4a1262', '1618331833071-ce81bd50d300', '1578926375605-eaf7559b1458', '1563301323-094e5843a962', '1572392640988-ba48d1a74457', '1584278773680-8d940a213dcf'];
          mediaUrl = `https://images.unsplash.com/photo-${artPhotoIds[i % artPhotoIds.length]}?w=800&h=600&fit=crop&q=80`;
        }

        // 5% chance of file message
        if (Math.random() < 0.05 && messageType === MessageType.TEXT) {
          messageType = MessageType.FILE;
          mediaUrl = `/uploads/document-${conversation.id}-${i}.pdf`;
        }

        const message = messageRepo.create();
        message.conversationId = conversation.id;
        message.senderId = senderId;
        message.content = content;
        message.type = messageType;
        message.mediaUrl = mediaUrl;
        message.isEdited = Math.random() < 0.05; // 5% edited
        message.editedAt =
          Math.random() < 0.05
            ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            : null;
        message.isDeleted = Math.random() < 0.02; // 2% deleted
        message.deletedAt =
          Math.random() < 0.02
            ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            : null;

        // Add reactions (30% chance)
        if (Math.random() < 0.3 && participantUserIds.length > 1) {
          const numReactions = Math.floor(
            Math.random() * Math.min(3, participantUserIds.length),
          );
          const reactions: Array<{
            userId: string;
            emoji: string;
            createdAt: Date;
          }> = [];

          for (let r = 0; r < numReactions; r++) {
            const reactorId =
              participantUserIds[
              Math.floor(Math.random() * participantUserIds.length)
              ];
            const emoji =
              messageTemplates.reactions[
              Math.floor(Math.random() * messageTemplates.reactions.length)
              ];

            // Avoid duplicate reactions from same user
            if (
              !reactions.find(
                (r) => r.userId === reactorId && r.emoji === emoji,
              )
            ) {
              reactions.push({
                userId: reactorId,
                emoji: emoji,
                createdAt: new Date(
                  Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                ),
              });
            }
          }

          message.reactions = reactions;
        }

        messages.push(message);

        // Create read receipts (70% read) - need to save messages first to get IDs
        // Will be created after messages are saved
      }

      // Last message info will be updated after save
    }

    await messageRepo.save(messages);
    console.log(`✅ Created ${messages.length} messages`);

    // Update conversations with last message info
    console.log('🔄 Updating conversation metadata...');
    for (const conversation of conversations) {
      const conversationMessages = messages.filter(
        (m) => m.conversationId === conversation.id,
      );
      if (conversationMessages.length > 0) {
        const lastMessage =
          conversationMessages[conversationMessages.length - 1];
        conversation.lastMessageContent = lastMessage.content;
        conversation.lastMessageSenderId = lastMessage.senderId;
        // Set a reasonable last message time
        conversation.lastMessageAt = new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        );
      }
    }

    await conversationRepo.save(conversations);
    console.log('✅ Updated conversation metadata');

    // Now create read receipts after messages are saved
    console.log('📬 Creating read receipts...');
    for (const conversation of conversations) {
      const conversationMessages = messages.filter(
        (m) => m.conversationId === conversation.id,
      );
      const conversationParticipants = participants.filter(
        (p) => p.conversationId === conversation.id,
      );
      const participantUserIds = conversationParticipants.map((p) => p.userId);

      for (const message of conversationMessages) {
        // 70% chance message is read
        if (Math.random() < 0.7) {
          for (const participantId of participantUserIds) {
            if (participantId !== message.senderId) {
              const baseTime =
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
              const receipt = readReceiptRepo.create();
              receipt.conversationId = conversation.id;
              receipt.messageId = message.id;
              receipt.userId = participantId;
              receipt.readAt = new Date(baseTime + Math.random() * 3600000); // Read within 1 hour after message
              receipt.deliveredAt = new Date(baseTime + Math.random() * 60000); // Delivered within 1 minute
              readReceipts.push(receipt);
            }
          }
        }
      }
    }

    await readReceiptRepo.save(readReceipts);
    console.log(`✅ Created ${readReceipts.length} read receipts`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✨ Messaging Service Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`💬 Conversations:  ${conversations.length}`);
    console.log(
      `   - Direct:       ${conversations.filter((c) => c.type === ConversationType.DIRECT).length}`,
    );
    console.log(
      `   - Group:        ${conversations.filter((c) => c.type === ConversationType.GROUP).length}`,
    );
    console.log(
      `   - Inquiry:      ${conversations.filter((c) => c.type === ConversationType.INQUIRY).length}`,
    );
    console.log(`👥 Participants:   ${participants.length}`);
    console.log(`📧 Messages:       ${messages.length}`);
    console.log(`✅ Read Receipts:  ${readReceipts.length}`);
    console.log('═══════════════════════════════════════\n');
  }
}

export default MessagingSeeder;
