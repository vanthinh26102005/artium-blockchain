/**
 * Master Seed Runner for All Services
 *
 * This script seeds both Identity and Artwork services in the correct order,
 * ensuring all foreign key relationships are properly established.
 *
 * Supports both ISOLATED and SHARED database strategies via DB_STRATEGY env var.
 *
 * Usage:
 *   npm run seed
 *
 * Or with ts-node:
 *   npx ts-node BE/seed-all.ts
 */

import { DataSource } from 'typeorm';
import { runIdentitySeeds } from './apps/identity-service/src/db/seeds/run-seeds';
import { runArtworkSeeds } from './apps/artwork-service/src/db/seeds/run-seeds';

// Import entities for Identity Service
import { User } from './apps/identity-service/src/domain/entities/user.entity';
import { SellerProfile } from './apps/identity-service/src/domain/entities/seller_profiles.entity';
import { SellerWebsite } from './apps/identity-service/src/domain/entities/seller_websites.entity';
import { RefreshToken } from './apps/identity-service/src/domain/entities/refresh-token.entity';

// Import entities for Artwork Service
import { Artwork } from './apps/artwork-service/src/domain/entities/artworks.entity';
import { ArtworkFolder } from './apps/artwork-service/src/domain/entities/artwork-folder.entity';
import { Tag } from './apps/artwork-service/src/domain/entities/tags.entity';
import { ArtworkTag } from './apps/artwork-service/src/domain/entities/artwork-tag.entity';
import { ArtworkComment } from './apps/artwork-service/src/domain/entities/artwork-comment.entity';
import { ArtworkCommentLike } from './apps/artwork-service/src/domain/entities/artwork-comment-like.entity';
import { ArtworkLike } from './apps/artwork-service/src/domain/entities/artwork-like.entity';

function getDatabaseConfig(serviceName: string) {
  const strategy = process.env.DB_STRATEGY || 'ISOLATED';
  const isShared = strategy === 'SHARED';

  if (isShared) {
    return {
      host: process.env.SHARED_DB_HOST || 'localhost',
      port: parseInt(process.env.SHARED_DB_PORT || '5454'),
      username: process.env.SHARED_DB_USERNAME || 'postgres',
      password: process.env.SHARED_DB_PASSWORD || '1',
      database: process.env.SHARED_DB_NAME || 'artium_global',
      schema: serviceName,
    };
  }

  const defaultPort = serviceName === 'identity' ? '5432' : '5434';

  return {
    host: process.env[`DB_HOST`] || 'localhost',
    port: parseInt(process.env[`DB_PORT`] || defaultPort),
    username: process.env[`DB_USERNAME`] || `${serviceName}_user`,
    password: process.env[`DB_PASSWORD`] || '1',
    database: process.env[`DB_NAME`] || `${serviceName}_db`,
    schema: undefined,
  };
}

async function ensureSchemaExists(serviceName: string) {
  const strategy = process.env.DB_STRATEGY || 'ISOLATED';
  if (strategy !== 'SHARED') {
    return;
  }

  const config = getDatabaseConfig(serviceName);

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
    console.log(`🔧 Creating schema '${serviceName}' if not exists...`);
    await tempDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${serviceName}"`);
    console.log(`✅ Schema '${serviceName}' ensured.\n`);
  } finally {
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ARTIUM DATABASE SEEDING MASTER       ║');
  console.log('╚════════════════════════════════════════╝\n');

  const strategy = process.env.DB_STRATEGY || 'ISOLATED';
  console.log(`📋 Database Strategy: ${strategy}\n`);

  // ============================================
  // 1. IDENTITY SERVICE
  // ============================================
  console.log('📋 Step 1: Initializing Identity Service Database...\n');

  // Ensure schema exists for SHARED mode
  await ensureSchemaExists('identity');

  const identityConfig = getDatabaseConfig('identity');
  console.log(`📋 Identity Database: ${identityConfig.database}${identityConfig.schema ? ` (schema: ${identityConfig.schema})` : ''}\n`);

  const identityDataSource = new DataSource({
    type: 'postgres',
    host: identityConfig.host,
    port: identityConfig.port,
    username: identityConfig.username,
    password: identityConfig.password,
    database: identityConfig.database,
    schema: identityConfig.schema,
    entities: [User, SellerProfile, SellerWebsite, RefreshToken],
    synchronize: true, // Seed script expects tables to exist in dev.
    logging: false,
  });

  try {
    await identityDataSource.initialize();
    console.log('✅ Identity Service database connected\n');

    const { userIds, sellerIds } = await runIdentitySeeds(identityDataSource);

    await identityDataSource.destroy();
    console.log('✅ Identity Service database connection closed\n');

    // ============================================
    // 2. ARTWORK SERVICE
    // ============================================
    console.log('📋 Step 2: Initializing Artwork Service Database...\n');

    // Ensure schema exists for SHARED mode
    await ensureSchemaExists('artwork');

    const artworkConfig = getDatabaseConfig('artwork');
    console.log(`📋 Artwork Database: ${artworkConfig.database}${artworkConfig.schema ? ` (schema: ${artworkConfig.schema})` : ''}\n`);

    const artworkDataSource = new DataSource({
      type: 'postgres',
      host: artworkConfig.host,
      port: artworkConfig.port,
      username: artworkConfig.username,
      password: artworkConfig.password,
      database: artworkConfig.database,
      schema: artworkConfig.schema,
      entities: [Artwork, ArtworkFolder, Tag, ArtworkTag, ArtworkComment, ArtworkCommentLike, ArtworkLike],
      synchronize: true, // Seed script expects tables to exist in dev.
      logging: false,
    });

    await artworkDataSource.initialize();
    console.log('✅ Artwork Service database connected\n');

    await runArtworkSeeds(artworkDataSource, userIds, sellerIds);

    await artworkDataSource.destroy();
    console.log('✅ Artwork Service database connection closed\n');

    // ============================================
    // COMPLETE
    // ============================================
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🎉 ALL SEEDING COMPLETED! 🎉         ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log('───────────────────────────────────────');
    console.log(`✅ Users Created:      ${userIds.length}`);
    console.log(`✅ Sellers Created:    ${sellerIds.length}`);
    console.log(`✅ Artworks Created:   200+`);
    console.log(`✅ Tags Created:       60+`);
    console.log(`✅ Folders Created:    55+`);
    console.log(`✅ Comments Created:   200+`);
    console.log(`✅ Likes Created:      800+`);
    console.log('───────────────────────────────────────\n');

    console.log('🔑 Test Credentials:');
    console.log('───────────────────────────────────────');
    console.log('Email:    admin@artium.com');
    console.log('Password: Test1234!');
    console.log('Roles:    ADMIN, SELLER, COLLECTOR');
    console.log('───────────────────────────────────────');
    console.log('Email:    seller1@artium.com');
    console.log('Password: Test1234!');
    console.log('Roles:    SELLER, COLLECTOR');
    console.log('───────────────────────────────────────');
    console.log('Email:    collector1@artium.com');
    console.log('Password: Test1234!');
    console.log('Roles:    COLLECTOR');
    console.log('───────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
