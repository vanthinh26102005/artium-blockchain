import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseHelper');

/**
 * Gets connection parameters for the shared database (without schema).
 * Used for schema creation before TypeORM connects.
 */
export const getSharedDbConnectionParams = (config: ConfigService) => {
  return {
    host: config.get<string>('SHARED_DB_HOST'),
    port: config.get<number>('SHARED_DB_PORT', 5454),
    username: config.get<string>('SHARED_DB_USERNAME', 'postgres'),
    password: config.get<string>('SHARED_DB_PASSWORD', 'root'),
    database: config.get<string>('SHARED_DB_NAME', 'artium_global'),
  };
};

/**
 * Ensures the schema exists BEFORE TypeORM tries to synchronize.
 * Uses TypeORM's DataSource for reliable connection handling.
 * This must be called before TypeORM connects in SHARED mode.
 */
export const ensureSchemaExists = async (
  config: ConfigService,
  serviceName: string,
): Promise<void> => {
  const strategy = config.get<string>('DB_STRATEGY', 'ISOLATED');

  if (strategy !== 'SHARED') {
    return; // No schema creation needed for isolated mode
  }

  const connectionParams = getSharedDbConnectionParams(config);

  if (!connectionParams.host) {
    throw new Error('DB_STRATEGY is SHARED but SHARED_DB_HOST is not defined.');
  }

  // Create a temporary DataSource WITHOUT schema to create the schema first
  const tempDataSource = new DataSource({
    type: 'postgres',
    host: connectionParams.host,
    port: connectionParams.port,
    username: connectionParams.username,
    password: connectionParams.password,
    database: connectionParams.database,
    // No schema here - connect to default public schema
    synchronize: false,
    logging: false,
  });

  try {
    await tempDataSource.initialize();
    logger.log(`Creating schema '${serviceName}' if not exists...`);
    await tempDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${serviceName}"`);
    logger.log(`Schema '${serviceName}' ensured.`);
  } catch (error) {
    logger.error(
      `Failed to ensure schema '${serviceName}': ${error.message}`,
      error.stack,
    );
    throw error;
  } finally {
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
    }
  }
};

export const getDatabaseConfig = (
  config: ConfigService,
  serviceName: string,
): TypeOrmModuleOptions => {
  const strategy = config.get<string>('DB_STRATEGY', 'ISOLATED');
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  const baseConfig = {
    type: 'postgres' as const,
    // In production, synchronization should generally be false,
    // but for this prototype/dev environment, we might keep it true or strictly follow env.
    synchronize: config.get<boolean>('DB_SYNCHRONIZE', !isProduction),
    autoLoadEntities: true,
    logging: config.get<string>('NODE_ENV') === 'development',
  };

  if (strategy === 'SHARED') {
    // Shared Database Mode
    // All services connect to the SAME host/db, but different SCHEMAS.
    const sharedHost = config.get<string>('SHARED_DB_HOST');
    if (!sharedHost) {
      throw new Error(
        'DB_STRATEGY is SHARED but SHARED_DB_HOST is not defined.',
      );
    }

    return {
      ...baseConfig,
      host: sharedHost,
      port: config.get<number>('SHARED_DB_PORT', 5432),
      username: config.get<string>('SHARED_DB_USERNAME', 'postgres'),
      password: config.get<string>('SHARED_DB_PASSWORD', 'root'),
      database: config.get<string>('SHARED_DB_NAME', 'artium_global'),
      schema: serviceName, // The magic sauce: isolation via schema
    };
  }

  // Isolated Mode (Default)
  // Backwards compatibility with existing setup.
  // We assume env vars are named like IDENTITY_DB_HOST, ARTWORK_DB_HOST, etc.
  const envPrefix = serviceName.toUpperCase().replace(/-/g, '_');
  const host = config.get<string>(`${envPrefix}_DB_HOST`);
  const database = config.get<string>(`${envPrefix}_DB_NAME`);

  // If specific env vars aren't found, it might fall back to generic DB_HOST if that was the old pattern.
  // But based on "Database per Microservice", specific vars are likely.
  // We'll trust the specific ones first.

  if (!host) {
    // Fallback or Error?
    // If the service was using just "DB_HOST" in its own .env, we should support that too
    // if we want to be truly drop-in compatible without renaming env vars in every service immediately.
    // However, the prompt implies we are building a "reusable integration module",
    // so we should standardize.
    // Let's check if generic DB_HOST exists and warn or use it?
    // For now, let's try the specific prefix, if missing, try generic DB_HOST as fallback.
    const genericHost = config.get<string>('DB_HOST');
    if (genericHost) {
      return {
        ...baseConfig,
        host: genericHost,
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>(
          'DB_USERNAME',
          config.get<string>('DB_USER', 'postgres'),
        ),
        password: config.get<string>(
          'DB_PASSWORD',
          config.get<string>('DB_PASS', 'root'),
        ),
        database: config.get<string>('DB_NAME', `${serviceName}_db`),
      };
    }
  }

  return {
    ...baseConfig,
    host: host,
    port: config.get<number>(`${envPrefix}_DB_PORT`, 5432),
    username: config.get<string>(
      `${envPrefix}_DB_USERNAME`,
      config.get<string>(`${envPrefix}_DB_USER`, 'postgres'),
    ),
    password: config.get<string>(
      `${envPrefix}_DB_PASSWORD`,
      config.get<string>(`${envPrefix}_DB_PASS`, 'root'),
    ),
    database: database || `${serviceName}_db`,
    // schema: undefined (defaults to public)
  };
};
