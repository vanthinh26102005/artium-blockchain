import {
  DynamicDatabaseModule,
  ITransactionService,
  TransactionService,
} from '@app/common';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Artwork,
  ArtworkComment,
  ArtworkCommentLike,
  ArtworkFolder,
  ArtworkLike,
  ArtworkTag,
  GcsStorageService,
  IArtworkFolderRepository,
  IArtworkRepository,
  ITagRepository,
  Tag,
} from './domain';

import {
  ArtworkFolderRepository,
  ArtworkRepository,
  TagRepository,
} from './infrastructure';

import {
  ArtworkFoldersController,
  ArtworksController,
  HealthController,
  TagsController,
  UploadController,
} from './presentation';
import {
  ArtworkFoldersMicroserviceController,
  ArtworkMicroserviceController,
  TagsMicroserviceController,
  UploadMicroserviceController,
} from './presentation/microservice';

import {
  AddImagesToArtworkHandler,
  BulkDeleteArtworksHandler,
  BulkMoveArtworksHandler,
  BulkUpdateArtworkStatusHandler,
  CountArtworksByStatusHandler,
  CountArtworksInFolderHandler,
  CreateArtworkFolderHandler,
  CreateArtworkHandler,
  CreateArtworkDraftHandler,
  CreateDefaultRootFolderHandler,
  CreateTagHandler,
  DeleteArtworkFolderHandler,
  DeleteArtworkHandler,
  DeleteTagHandler,
  DuplicateArtworkHandler,
  FindArtworksByTagsHandler,
  FindArtworksInFolderHandler,
  GetArtworkFolderHandler,
  GetArtworkHandler,
  GetArtworkUploadDraftHandler,
  GetFolderTreeHandler,
  GetTagHandler,
  ListArtworkFoldersHandler,
  ListArtworksHandler,
  ListSellerAuctionArtworkCandidatesHandler,
  ListTagsHandler,
  MarkArtworkAsSoldHandler,
  MarkArtworkInAuctionHandler,
  MoveArtworkFolderHandler,
  RemoveImagesFromArtworkHandler,
  ReorderFoldersHandler,
  SaveArtworkDraftHandler,
  SearchArtworksHandler,
  SearchTagsHandler,
  SubmitArtworkDraftHandler,
  ToggleFolderVisibilityHandler,
  UpdateArtworkFolderHandler,
  UpdateArtworkHandler,
  UpdateArtworkImagesHandler,
  UpdateTagHandler,
} from './application';
import { SeederModule } from './db/seeder.module';
import { SeederService } from './db/seeder.service';

export const CommandHandlers = [
  CreateArtworkFolderHandler,
  CreateDefaultRootFolderHandler,
  DeleteArtworkFolderHandler,
  MoveArtworkFolderHandler,
  ReorderFoldersHandler,
  ToggleFolderVisibilityHandler,
  UpdateArtworkFolderHandler,

  AddImagesToArtworkHandler,
  BulkDeleteArtworksHandler,
  BulkMoveArtworksHandler,
  BulkUpdateArtworkStatusHandler,
  CreateArtworkHandler,
  CreateArtworkDraftHandler,
  DeleteArtworkHandler,
  DuplicateArtworkHandler,
  MarkArtworkInAuctionHandler,
  MarkArtworkAsSoldHandler,
  RemoveImagesFromArtworkHandler,
  SaveArtworkDraftHandler,
  SubmitArtworkDraftHandler,
  UpdateArtworkHandler,
  UpdateArtworkImagesHandler,

  CreateTagHandler,
  UpdateTagHandler,
  DeleteTagHandler,
];

export const QueryHandlers = [
  CountArtworksInFolderHandler,
  FindArtworksInFolderHandler,
  GetArtworkFolderHandler,
  GetFolderTreeHandler,
  ListArtworkFoldersHandler,

  CountArtworksByStatusHandler,
  FindArtworksByTagsHandler,
  GetArtworkHandler,
  GetArtworkUploadDraftHandler,
  ListArtworksHandler,
  ListSellerAuctionArtworkCandidatesHandler,
  SearchArtworksHandler,

  GetTagHandler,
  ListTagsHandler,
  SearchTagsHandler,
];

export const Repositories = [
  { provide: ITagRepository, useClass: TagRepository },
  { provide: IArtworkFolderRepository, useClass: ArtworkFolderRepository },
  { provide: IArtworkRepository, useClass: ArtworkRepository },
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
  GcsStorageService,
];

export const Controllers = [
  HealthController,
  ArtworksController,
  ArtworkFoldersController,
  TagsController,
  UploadController,
  ArtworkMicroserviceController,
  TagsMicroserviceController,
  ArtworkFoldersMicroserviceController,
  UploadMicroserviceController,
];

const OrdersServiceClient = {
  name: 'ORDERS_SERVICE',
  transport: Transport.TCP as const,
  options: {
    host: process.env.ORDERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.ORDERS_SERVICE_PORT || '3104', 10),
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/artwork-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('artwork'),
    TypeOrmModule.forFeature([
      Artwork,
      ArtworkFolder,
      ArtworkTag,
      ArtworkComment,
      ArtworkCommentLike,
      ArtworkLike,
      Tag,
      OutboxEntity,
    ]),

    OutboxModule,
    CqrsModule,
    ClientsModule.register([OrdersServiceClient]),
    SeederModule,
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
export class ArtworkServiceModule implements OnApplicationBootstrap {
  constructor(private readonly seederService: SeederService) {}

  async onApplicationBootstrap() {
    await this.seederService.seed();
  }
}
