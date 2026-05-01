import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { AuthLibModule } from '@app/auth';
import {
  MICROSERVICES,
  getMicroserviceConfig,
} from './config/microservices.config';
import { ArtworkFoldersController } from './presentation/http/controllers/artwork/artwork-folders.controller';
import { ArtworkController } from './presentation/http/controllers/artwork/artwork.controller';
import { SellerProfilesController } from './presentation/http/controllers/identity/seller-profiles.controller';
import { UserController } from './presentation/http/controllers/identity/users.controller';
import { MessagingController } from './presentation/http/controllers/messaging.controller';
import { NotificationsController } from './presentation/http/controllers/notification/notifications.controller';
import { OrdersController } from './presentation/http/controllers/orders.controller';
import { AuctionsController } from './presentation/http/controllers/auctions.controller';
import { PaymentsController } from './presentation/http/controllers/payment/payments.controller';
import { InvoicesController } from './presentation/http/controllers/payment/invoices.controller';
import { PayoutsController } from './presentation/http/controllers/payment/payouts.controller';
import { QuickSellInvoicesController } from './presentation/http/controllers/payment/quick-sell-invoices.controller';
import { TagsController } from './presentation/http/controllers/artwork/tags.controller';
import { UploadController } from './presentation/http/controllers/artwork/upload.controller';
import { MessagingGateway } from './presentation/http/gateways/messaging.gateway';
import { AuctionGateway } from './presentation/http/gateways/auction.gateway';
import { EventsController } from './presentation/http/controllers/events/events.controller';
import { CommunityMomentsController } from './presentation/http/controllers/community/moments.controller';
import { CommunityMoodboardsController } from './presentation/http/controllers/community/moodboards.controller';
import { CommunityUploadsController } from './presentation/http/controllers/community/uploads.controller';
import { FollowersController } from './presentation/http/controllers/community/followers.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api-gateway/.env.local',
    }),
    AuthLibModule,
    ClientsModule.register([
      {
        name: MICROSERVICES.IDENTITY_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.IDENTITY_SERVICE),
      },
      {
        name: MICROSERVICES.ARTWORK_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.ARTWORK_SERVICE),
      },
      {
        name: MICROSERVICES.PAYMENTS_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.PAYMENTS_SERVICE),
      },
      {
        name: MICROSERVICES.ORDERS_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.ORDERS_SERVICE),
      },
      {
        name: MICROSERVICES.MESSAGING_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.MESSAGING_SERVICE),
      },
      {
        name: MICROSERVICES.NOTIFICATIONS_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.NOTIFICATIONS_SERVICE),
      },
      {
        name: MICROSERVICES.EVENTS_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.EVENTS_SERVICE),
      },
      {
        name: MICROSERVICES.COMMUNITY_SERVICE,
        ...getMicroserviceConfig(MICROSERVICES.COMMUNITY_SERVICE),
      },
    ]),
  ],
  controllers: [
    UserController,
    SellerProfilesController,

    // More specific routes must come before generic routes
    ArtworkFoldersController,
    TagsController,
    UploadController,
    ArtworkController,

    PaymentsController,
    InvoicesController,
    PayoutsController,
    QuickSellInvoicesController,

    AuctionsController,
    OrdersController,
    MessagingController,
    NotificationsController,
    EventsController,
    CommunityUploadsController,
    CommunityMomentsController,
    CommunityMoodboardsController,
    FollowersController,
  ],
  providers: [MessagingGateway, AuctionGateway],
})
export class ApiGatewayModule {}
