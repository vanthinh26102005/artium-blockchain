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
import { AppRabbitMQModule } from '@app/rabbitmq';

import {
  Moment,
  MomentView,
  MomentTaggedArtwork,
  Moodboard,
  MoodboardArtwork,
  MoodboardMedia,
  MoodboardCollaborator,
  Follower,
  Comment,
  Like,
  Testimonial,
  ActivityFeed,
  CommunityMedia,
  CommunityMediaStorageService,
  ICommunityMediaRepository,
  IMomentRepository,
  IMoodboardMediaRepository,
  IMoodboardRepository,
  IMoodboardArtworkRepository,
  IFollowerRepository,
  ICommentRepository,
  ILikeRepository,
} from './domain';

import {
  MomentRepository,
  MoodboardRepository,
  MoodboardArtworkRepository,
  MoodboardMediaRepository,
  FollowerRepository,
  CommentRepository,
  LikeRepository,
  CommunityMediaRepository,
} from './infrastructure';

import {
  CreateMomentHandler,
  UpdateMomentHandler,
  DeleteMomentHandler,
  CreateMoodboardHandler,
  UpdateMoodboardHandler,
  DeleteMoodboardHandler,
  AddArtworkToMoodboardHandler,
  RemoveArtworkFromMoodboardHandler,
  FollowUserHandler,
  UnfollowUserHandler,
  CreateCommentHandler,
  SetLikeStatusHandler,
  UploadCommunityMomentMediaHandler,
  UploadCommunityMoodboardMediaHandler,
} from './application';

import {
  GetMomentHandler,
  ListUserMomentsHandler,
  GetMoodboardHandler,
  ListArtworkMoodboardIdsForUserHandler,
  ListUserMoodboardsHandler,
  GetFollowersHandler,
  GetFollowingHandler,
  ListCommentsByEntityHandler,
  IsLikedHandler,
} from './application';

import {
  MomentsMicroserviceController,
  MoodboardsMicroserviceController,
  FollowersMicroserviceController,
  CommentsMicroserviceController,
  LikesMicroserviceController,
  CommunityMediaMicroserviceController,
  HealthController,
} from './presentation';

export const CommandHandlers = [
  CreateMomentHandler,
  UpdateMomentHandler,
  DeleteMomentHandler,

  CreateMoodboardHandler,
  UpdateMoodboardHandler,
  DeleteMoodboardHandler,
  AddArtworkToMoodboardHandler,
  RemoveArtworkFromMoodboardHandler,

  FollowUserHandler,
  UnfollowUserHandler,

  CreateCommentHandler,
  SetLikeStatusHandler,
  UploadCommunityMomentMediaHandler,
  UploadCommunityMoodboardMediaHandler,
];

export const QueryHandlers = [
  GetMomentHandler,
  ListUserMomentsHandler,

  GetMoodboardHandler,
  ListArtworkMoodboardIdsForUserHandler,
  ListUserMoodboardsHandler,

  GetFollowersHandler,
  GetFollowingHandler,

  ListCommentsByEntityHandler,
  IsLikedHandler,
];

export const Repositories = [
  { provide: IMomentRepository, useClass: MomentRepository },
  { provide: ICommunityMediaRepository, useClass: CommunityMediaRepository },
  { provide: IMoodboardRepository, useClass: MoodboardRepository },
  { provide: IMoodboardMediaRepository, useClass: MoodboardMediaRepository },
  {
    provide: IMoodboardArtworkRepository,
    useClass: MoodboardArtworkRepository,
  },
  { provide: IFollowerRepository, useClass: FollowerRepository },
  { provide: ICommentRepository, useClass: CommentRepository },
  { provide: ILikeRepository, useClass: LikeRepository },
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
  CommunityMediaStorageService,
];

export const Controllers = [
  HealthController,
  MomentsMicroserviceController,
  MoodboardsMicroserviceController,
  FollowersMicroserviceController,
  CommentsMicroserviceController,
  LikesMicroserviceController,
  CommunityMediaMicroserviceController,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/community-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('community'),
    TypeOrmModule.forFeature([
      Moment,
      MomentView,
      MomentTaggedArtwork,
      Moodboard,
      MoodboardArtwork,
      MoodboardMedia,
      MoodboardCollaborator,
      Follower,
      Comment,
      Like,
      Testimonial,
      ActivityFeed,
      CommunityMedia,
      OutboxEntity,
    ]),

    OutboxModule,
    AppRabbitMQModule,
    CqrsModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    ...Services,
  ],
  exports: [ConfigModule],
})
export class CommunityServiceModule {}
