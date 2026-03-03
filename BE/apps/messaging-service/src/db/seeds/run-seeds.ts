import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { MessagingSeeder } from './messaging.seed';
import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/message.entity';
import { ConversationParticipant } from '../../domain/entities/conversation-participant.entity';
import { ReadReceipt } from '../../domain/entities/read-receipt.entity';
import { TypingIndicator } from '../../domain/entities/typing-indicator.entity';
import { MessageAttachment } from '../../domain/entities/message-attachment.entity';

const SERVICE_NAME = 'messaging';

/**
 * Gets database configuration based on DB_STRATEGY env variable.
 * Supports both ISOLATED (per-service DB) and SHARED (schema-based) strategies.
 */
function getDatabaseConfig() {
  const strategy = process.env.DB_STRATEGY || 'SHARED';
  const isShared = strategy === 'SHARED';

  if (isShared) {
    return {
      host: process.env.SHARED_DB_HOST || 'localhost',
      port: parseInt(process.env.SHARED_DB_PORT || '5454'),
      username: process.env.SHARED_DB_USERNAME || 'postgres',
      password: process.env.SHARED_DB_PASSWORD || '1',
      database: process.env.SHARED_DB_NAME || 'artium_global',
      schema: SERVICE_NAME,
    };
  }

  // ISOLATED mode (default)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5438'),
    username: process.env.DB_USER || 'messaging_user',
    password: process.env.DB_PASS || '1',
    database: process.env.DB_NAME || 'messaging_db',
    schema: undefined,
  };
}

/**
 * Ensures schema exists for SHARED mode before running seeds.
 * Uses TypeORM DataSource for reliable connection handling.
 */
async function ensureSchemaExists(
  config: ReturnType<typeof getDatabaseConfig>,
) {
  if (!config.schema) {
    return; // Not in SHARED mode
  }

  // Create a temporary DataSource WITHOUT schema to create the schema first
  const tempDataSource = new DataSource({
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    synchronize: false,
    logging: false,
  });

  try {
    await tempDataSource.initialize();
    console.log(`🔧 Creating schema '${config.schema}' if not exists...`);
    await tempDataSource.query(
      `CREATE SCHEMA IF NOT EXISTS "${config.schema}"`,
    );
    console.log(`✅ Schema '${config.schema}' ensured.\n`);
  } finally {
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
    }
  }
}

/**
 * Fetches user IDs from identity service schema/database.
 * In SHARED mode, reads from identity schema.
 * In ISOLATED mode, connects to identity_db directly.
 */
async function fetchUserIds(): Promise<string[]> {
  const strategy = process.env.DB_STRATEGY || 'SHARED';
  const isShared = strategy === 'SHARED';

  let identityDataSource: DataSource;

  if (isShared) {
    // SHARED mode: Connect to same DB, identity schema
    identityDataSource = new DataSource({
      type: 'postgres',
      host: process.env.SHARED_DB_HOST || 'localhost',
      port: parseInt(process.env.SHARED_DB_PORT || '5454'),
      username: process.env.SHARED_DB_USERNAME || 'postgres',
      password: process.env.SHARED_DB_PASSWORD || '1',
      database: process.env.SHARED_DB_NAME || 'artium_global',
      schema: 'identity',
      synchronize: false,
      logging: false,
    });
  } else {
    // ISOLATED mode: Connect to separate identity_db
    identityDataSource = new DataSource({
      type: 'postgres',
      host: process.env.IDENTITY_DB_HOST || 'localhost',
      port: parseInt(process.env.IDENTITY_DB_PORT || '5437'),
      username: process.env.IDENTITY_DB_USER || 'identity_user',
      password: process.env.IDENTITY_DB_PASS || '1',
      database: process.env.IDENTITY_DB_NAME || 'identity_db',
      synchronize: false,
      logging: false,
    });
  }

  try {
    await identityDataSource.initialize();
    console.log('🔗 Connected to Identity Service database');

    // In SHARED mode, query with schema prefix; in ISOLATED mode, no schema prefix needed
    const query = isShared
      ? 'SELECT user_id as id FROM identity.users ORDER BY created_at ASC'
      : 'SELECT user_id as id FROM users ORDER BY created_at ASC';

    const users = await identityDataSource.query(query);
    const userIds = users.map((u: any) => u.id);

    console.log(
      `✅ Fetched ${userIds.length} user IDs from Identity Service\n`,
    );

    await identityDataSource.destroy();
    return userIds;
  } catch (error) {
    console.error('❌ Failed to fetch user IDs from Identity Service:', error);
    console.error('⚠️  Make sure Identity Service database is seeded first!');
    if (identityDataSource.isInitialized) {
      await identityDataSource.destroy();
    }
    throw error;
  }
}

async function main() {
  console.log('🔧 Initializing Messaging Service Database Connection...\n');

  const dbConfig = getDatabaseConfig();
  const strategy = process.env.DB_STRATEGY || 'SHARED';
  console.log(`📋 Database Strategy: ${strategy}`);
  console.log(
    `📋 Database: ${dbConfig.database}${dbConfig.schema ? ` (schema: ${dbConfig.schema})` : ''}\n`,
  );

  // Ensure schema exists for SHARED mode
  await ensureSchemaExists(dbConfig);

  // Fetch user IDs from Identity Service
  console.log('📥 Fetching user IDs from Identity Service...');
  const userIds = await fetchUserIds();

  if (userIds.length === 0) {
    console.error(
      '❌ No users found in Identity Service. Please seed Identity Service first.',
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    schema: dbConfig.schema,
    entities: [
      Conversation,
      Message,
      ConversationParticipant,
      ReadReceipt,
      TypingIndicator,
      MessageAttachment,
    ],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const seeder = new MessagingSeeder();
    await seeder.run(dataSource, userIds);

    // Get final counts
    const conversationCount = await dataSource
      .getRepository(Conversation)
      .count();
    const messageCount = await dataSource.getRepository(Message).count();
    const participantCount = await dataSource
      .getRepository(ConversationParticipant)
      .count();

    console.log('\n📊 Final Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total Conversations:  ${conversationCount}`);
    console.log(`✅ Total Messages:       ${messageCount}`);
    console.log(`✅ Total Participants:   ${participantCount}`);
    console.log('═══════════════════════════════════════\n');

    await dataSource.destroy();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (require.main === module) {
  main();
}
