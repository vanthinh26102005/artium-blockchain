import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { IdentitySeeder } from './identity.seed';
import { User } from '../../domain/entities/user.entity';
import { SellerProfile } from '../../domain/entities/seller_profiles.entity';
import { SellerWebsite } from '../../domain/entities/seller_websites.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

const SERVICE_NAME = 'identity';

export async function runIdentitySeeds(
  dataSource: DataSource,
): Promise<{ userIds: string[]; sellerIds: string[] }> {
  const seeder = new IdentitySeeder();
  await seeder.run(dataSource);

  // Get all user IDs and seller IDs for artwork service
  const userRepo = dataSource.getRepository('User');
  const sellerProfileRepo = dataSource.getRepository('SellerProfile');

  const users = await userRepo.find({ select: ['id'] });
  const sellers = await sellerProfileRepo.find({ select: ['userId'] });

  const userIds = users.map((u: any) => u.id);
  const sellerIds = sellers.map((s: any) => s.userId);

  return { userIds, sellerIds };
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
    port: parseInt(process.env.DB_PORT || '5437'),
    username: process.env.DB_USER || 'identity_user',
    password: process.env.DB_PASS || '1',
    database: process.env.DB_NAME || 'identity_db',
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

async function main() {
  console.log('🔧 Initializing Identity Service Database Connection...\n');

  const dbConfig = getDatabaseConfig();
  const strategy = process.env.DB_STRATEGY || 'ISOLATED';
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
    entities: [User, SellerProfile, SellerWebsite, RefreshToken],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const { userIds, sellerIds } = await runIdentitySeeds(dataSource);

    console.log('\n📊 Final Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Total Users:     ${userIds.length}`);
    console.log(`✅ Total Sellers:   ${sellerIds.length}`);
    console.log('═══════════════════════════════════════\n');

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
