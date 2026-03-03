import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DynamicDatabaseModule,
  ITransactionService,
  TransactionService,
} from '@app/common';
import { OutboxEntity, OutboxModule } from '@app/outbox';

import { Event, EventAttendee, EventArtwork, EventRsvp } from './domain';
import {
  CreateEventHandler,
  UpdateEventHandler,
  DeleteEventHandler,
  SendEventInvitationsHandler,
  GetEventHandler,
  GetEventsByCreatorHandler,
  GetPublicEventsHandler,
} from './application';
import { EventsMicroserviceController } from './presentation/microservice/events.microservice.controller';

export const CommandHandlers = [
  CreateEventHandler,
  UpdateEventHandler,
  DeleteEventHandler,
  SendEventInvitationsHandler,
];

export const QueryHandlers = [
  GetEventHandler,
  GetEventsByCreatorHandler,
  GetPublicEventsHandler,
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/events-service/.env.local',
    }),
    DynamicDatabaseModule.forRoot('events'),
    TypeOrmModule.forFeature([
      Event,
      EventRsvp,
      EventAttendee,
      EventArtwork,
      OutboxEntity,
    ]),
    OutboxModule,
    CqrsModule,
  ],
  controllers: [EventsMicroserviceController],
  providers: [...CommandHandlers, ...QueryHandlers, ...Services],
})
export class EventsRsvpServiceModule {}
