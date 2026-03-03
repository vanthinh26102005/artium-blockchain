import { DynamicModule, Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig, ensureSchemaExists } from './database.helper';

const logger = new Logger('DynamicDatabaseModule');

@Global()
@Module({})
export class DynamicDatabaseModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: DynamicDatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const strategy = configService.get<string>(
              'DB_STRATEGY',
              'ISOLATED',
            );
            logger.log(`[${serviceName}] DB_STRATEGY: ${strategy}`);
            logger.log(
              `[${serviceName}] SHARED_DB_HOST: ${configService.get<string>('SHARED_DB_HOST')}`,
            );

            // CRITICAL: Ensure schema exists BEFORE TypeORM tries to synchronize
            // This prevents the 42P01 "undefined_table" error in SHARED mode
            try {
              await ensureSchemaExists(configService, serviceName);
            } catch (error) {
              logger.error(
                `Failed to ensure schema for service '${serviceName}': ${error.message}`,
              );
              throw error;
            }

            const config = getDatabaseConfig(configService, serviceName);
            logger.log(
              `[${serviceName}] TypeORM config: host=${(config as any).host}, db=${(config as any).database}, schema=${(config as any).schema || 'public'}`,
            );

            return config;
          },
        }),
      ],
      providers: [
        {
          provide: 'SERVICE_NAME',
          useValue: serviceName,
        },
      ],
      exports: [TypeOrmModule],
    };
  }
}
