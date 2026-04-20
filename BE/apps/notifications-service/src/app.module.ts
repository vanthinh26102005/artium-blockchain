import {
  ITransactionService,
  TransactionService,
  DynamicDatabaseModule,
} from '@app/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import { join } from 'path';
import {
  CreateNotificationHistoryHandler,
  GetNotificationHistoryHandler,
  ListNotificationHistoriesHandler,
  SendEmailEventHandler,
  NewMessageEventHandler,
  BlockchainAuctionEventHandler,
  UpdateNotificationHistoryHandler,
} from './application';
import { SeederModule } from './db/seeder.module';
import { SeederService } from './db/seeder.service';
import { INotificationHistoryRepository, NotificationHistory } from './domain';
import { NotificationHistoryRepository } from './infrastructure';
import {
  HealthController,
  NotificationHistoryController,
} from './presentation';

export const CommandHandlers = [
  CreateNotificationHistoryHandler,
  UpdateNotificationHistoryHandler,

  SendEmailEventHandler,
  NewMessageEventHandler,
  BlockchainAuctionEventHandler,
];

export const QueryHandlers = [
  GetNotificationHistoryHandler,
  ListNotificationHistoriesHandler,
];

export const Repositories = [
  {
    provide: INotificationHistoryRepository,
    useClass: NotificationHistoryRepository,
  },
];
export const InfrastructureServices = [];
export const Controllers = [HealthController, NotificationHistoryController];
export const Strategies = [];
export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notifications-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('notifications'),
    TypeOrmModule.forFeature([NotificationHistory, OutboxEntity]),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const smtpUser = configService.get<string>('SMTP_USER');
        const smtpPass = configService.get<string>('SMTP_PASS');
        const requiresAuth =
          smtpUser &&
          smtpPass &&
          smtpUser.trim() !== '' &&
          smtpPass.trim() !== '';

        return {
          transport: {
            host: configService.get<string>('SMTP_HOST'),
            port: configService.get<number>('SMTP_PORT'),
            secure: false,
            ...(requiresAuth && {
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }),
          },
          defaults: {
            from: `"Artium" <${configService.get<string>('SMTP_FROM')}>`,
          },
          template: {
            dir: join(
              process.cwd(),
              'apps/notifications-service/src/templates',
            ),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
    }),

    OutboxModule,
    CqrsModule,
    SeederModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    ...InfrastructureServices,
    ...Strategies,
    ...Services,
  ],
  exports: [ConfigModule],
})
export class NotificationsServiceModule implements OnApplicationBootstrap {
  constructor(private readonly seederService: SeederService) {}

  async onApplicationBootstrap() {
    await this.seederService.seed();
  }
}
