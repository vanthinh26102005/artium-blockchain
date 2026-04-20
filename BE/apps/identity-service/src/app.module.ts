import {
  ITransactionService,
  TransactionService,
  DynamicDatabaseModule,
} from '@app/common';
import { AppRabbitMQModule } from '@app/rabbitmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { OAuth2Client } from 'google-auth-library';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import {
  CompleteUserRegistrationHandler,
  ConfirmNewPasswordHandler,
  CreateSellerProfileHandler,
  DeleteSellerProfileHandler,
  GetFeaturedSellerProfilesHandler,
  GetSellerProfileByIdHandler,
  GetSellerProfileBySlugHandler,
  GetSellerProfileByUserIdHandler,
  GetUserByIdHandler,
  GetUserBySlugHandler,
  GetWalletNonceHandler,
  InitiateUserRegistrationHandler,
  ListSellerProfilesHandler,
  LoginByEmailHandler,
  LoginByGoogleHandler,
  LoginByWalletHandler,
  RequestPasswordResetHandler,
  StripeCustomerCreatedEventHandler,
  UpdatePaymentOnboardingHandler,
  UpdateProfileVisibilityHandler,
  UpdateSellerProfileHandler,
  UpdateUserProfileHandler,
  UpdateVerificationStatusHandler,
  VerifyPasswordResetHandler,
} from './application';
import { SeederModule } from './db/seeder.module';
import { SeederService } from './db/seeder.service';
import {
  IRefreshTokenRepository,
  ISellerProfileRepository,
  IUserRepository,
  NonceService,
  OtpService,
  RefreshToken,
  RegistrationService,
  SellerProfile,
  SellerWebsite,
  TokenService,
  User,
} from './domain';
import {
  RefreshTokenRepository,
  SellerProfileRepository,
  UserRepository,
} from './infrastructure';
import {
  HealthController,
  SellerProfilesController,
  UsersController,
} from './presentation';
import { UsersMicroserviceController } from './presentation/microservice';
import { SellerProfilesMicroserviceController } from './presentation/microservice/seller-profiles.microservice.controller';

export const CommandHandlers = [
  InitiateUserRegistrationHandler,
  CompleteUserRegistrationHandler,

  LoginByEmailHandler,
  LoginByGoogleHandler,
  LoginByWalletHandler,

  ConfirmNewPasswordHandler,
  RequestPasswordResetHandler,
  VerifyPasswordResetHandler,

  CreateSellerProfileHandler,
  UpdateSellerProfileHandler,
  DeleteSellerProfileHandler,
  UpdateVerificationStatusHandler,
  UpdateProfileVisibilityHandler,
  UpdatePaymentOnboardingHandler,
  UpdateUserProfileHandler,
];

export const QueryHandlers = [
  GetUserByIdHandler,
  GetUserBySlugHandler,
  GetWalletNonceHandler,

  GetSellerProfileByIdHandler,
  GetSellerProfileByUserIdHandler,
  GetSellerProfileBySlugHandler,
  ListSellerProfilesHandler,
  GetFeaturedSellerProfilesHandler,
];

export const EventHandlers = [StripeCustomerCreatedEventHandler];

export const Repositories = [
  { provide: IUserRepository, useClass: UserRepository },
  { provide: IRefreshTokenRepository, useClass: RefreshTokenRepository },
  { provide: ISellerProfileRepository, useClass: SellerProfileRepository },
];
export const InfrastructureServices = [
  OtpService,
  TokenService,
  RegistrationService,
  NonceService,
];
export const Controllers = [
  UsersController,
  SellerProfilesController,
  HealthController,
  UsersMicroserviceController,
  SellerProfilesMicroserviceController,
];
export const Strategies = [];
export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/identity-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('identity'),
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      SellerProfile,
      SellerWebsite,
      OutboxEntity,
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');

        const logger = new Logger('RedisCache');

        logger.log(
          `[Redis] Configuring Redis cache with host: ${host}, port: ${port}`,
        );

        try {
          const cacheConfig = {
            store: redisStore,
            host,
            port,
          };
          logger.log(`[Redis] Redis cache configuration successfully prepared`);
          return cacheConfig;
        } catch (error) {
          logger.error(
            `[Redis] Failed to configure Redis cache: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
        },
      }),
    }),

    OutboxModule,
    AppRabbitMQModule,

    CqrsModule,
    SeederModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...Repositories,
    ...InfrastructureServices,
    ...Strategies,
    ...Services,
    {
      provide: 'GOOGLE_OAUTH2_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client({
          clientId: configService.get<string>('GOOGLE_CLIENT_ID'),
          clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
        });
      },
    },
  ],
  exports: [ConfigModule],
})
export class IdentityServiceModule implements OnApplicationBootstrap {
  constructor(private readonly seederService: SeederService) {}

  async onApplicationBootstrap() {
    await this.seederService.seed();
  }
}
