import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ArtworkSeeder } from './artwork.seed';
import { Artwork } from '../../domain/entities/artworks.entity';
import { ArtworkFolder } from '../../domain/entities/artwork-folder.entity';
import { Tag } from '../../domain/entities/tags.entity';
import { ArtworkTag } from '../../domain/entities/artwork-tag.entity';
import { ArtworkComment } from '../../domain/entities/artwork-comment.entity';
import { ArtworkCommentLike } from '../../domain/entities/artwork-comment-like.entity';
import { ArtworkLike } from '../../domain/entities/artwork-like.entity';

const SERVICE_NAME = 'artwork';

export async function runArtworkSeeds(
  dataSource: DataSource,
  userIds: string[],
  sellerIds: string[],
): Promise<void> {
  const seeder = new ArtworkSeeder();
  await seeder.run(dataSource, userIds, sellerIds);
}

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
    port: parseInt(process.env.DB_PORT || '5434'),
    username: process.env.DB_USER || 'artwork_user',
    password: process.env.DB_PASS || '1',
    database: process.env.DB_NAME || 'artwork_db',
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
    synchronize: true,
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

async function main() {
  console.log(
    '⚠️  WARNING: Running artwork seeder requires existing users from identity service!\n',
  );
  console.log('🔧 Initializing Artwork Service Database Connection...\n');

  const dbConfig = getDatabaseConfig();
  const strategy = process.env.DB_STRATEGY || 'SHARED';
  console.log(`📋 Database Strategy: ${strategy}`);
  console.log(
    `📋 Database: ${dbConfig.database}${dbConfig.schema ? ` (schema: ${dbConfig.schema})` : ''}\n`,
  );

  // Ensure schema exists for SHARED mode
  await ensureSchemaExists(dbConfig);

  const dataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    schema: dbConfig.schema,
    entities: [
      Artwork,
      ArtworkFolder,
      Tag,
      ArtworkTag,
      ArtworkComment,
      ArtworkCommentLike,
      ArtworkLike,
    ],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // For standalone execution, try fetching real user IDs from identity database
    console.log('📋 Fetching real user IDs from identity service database...');

    let realUserIds: string[] = [];
    let realSellerIds: string[] = [];

    try {
      // Connect to identity database to fetch real user/seller IDs
      const identityStrategy = process.env.DB_STRATEGY || 'SHARED';
      const isShared = identityStrategy === 'SHARED';

      const identityConfig = isShared
        ? {
            host: process.env.SHARED_DB_HOST || 'localhost',
            port: parseInt(process.env.SHARED_DB_PORT || '5454'),
            username: process.env.SHARED_DB_USERNAME || 'postgres',
            password: process.env.SHARED_DB_PASSWORD || '1',
            database: process.env.SHARED_DB_NAME || 'artium_global',
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.IDENTITY_DB_PORT || '5432'),
            username: process.env.IDENTITY_DB_USER || 'identity_user',
            password: process.env.IDENTITY_DB_PASS || '1',
            database: process.env.IDENTITY_DB_NAME || 'identity_db',
          };

      const identityDs = new DataSource({
        type: 'postgres',
        ...identityConfig,
        schema: isShared ? 'identity' : undefined,
        synchronize: false,
        logging: false,
      });

      await identityDs.initialize();

      const schemaPrefix = isShared ? '"identity".' : '';
      const userRows: { id: string }[] = await identityDs.query(
        `SELECT "id" FROM ${schemaPrefix}"users" WHERE "is_active" = true`,
      );
      const sellerRows: { user_id: string }[] = await identityDs.query(
        `SELECT "user_id" FROM ${schemaPrefix}"seller_profiles" WHERE "is_active" = true`,
      );

      realUserIds = userRows.map((r) => r.id);
      realSellerIds = sellerRows.map((r) => r.user_id);

      await identityDs.destroy();
      console.log(
        `✅ Found ${realUserIds.length} users and ${realSellerIds.length} sellers from identity DB\n`,
      );
    } catch (err) {
      console.warn(
        '⚠️  Could not connect to identity database:',
        (err as Error).message,
      );
    }

    if (realSellerIds.length > 0) {
      await runArtworkSeeds(dataSource, realUserIds, realSellerIds);
    } else {
      console.log(
        '⚠️  No real sellers found. Using mock UUIDs (artworks will not reference real users).\n',
      );
      const mockUserIds = Array.from({ length: 60 }, () => uuidv4());
      const mockSellerIds = Array.from({ length: 31 }, () => uuidv4());
      await runArtworkSeeds(dataSource, mockUserIds, mockSellerIds);
    }

    await dataSource.destroy();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (require.main === module) {
  main();
}
