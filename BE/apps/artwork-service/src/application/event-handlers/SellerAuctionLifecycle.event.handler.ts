import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { SellerAuctionStartStatusObject } from '@app/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IArtworkAuctionLifecycleRepository } from '../../domain/interfaces/artwork-auction-lifecycle.repository.interface';

@Injectable()
export class SellerAuctionLifecycleEventHandler {
  private readonly logger = new Logger(SellerAuctionLifecycleEventHandler.name);

  constructor(
    @Inject(IArtworkAuctionLifecycleRepository)
    private readonly lifecycleRepo: IArtworkAuctionLifecycleRepository,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.ORDER_EVENTS,
    routingKey: RoutingKey.SELLER_AUCTION_LIFECYCLE_UPDATED,
    queue: 'artwork-service.seller-auction.lifecycle-updated',
    queueOptions: { durable: true },
  })
  async handleLifecycleUpdated(message: SellerAuctionStartStatusObject) {
    if (!message?.sellerId || !message?.artworkId || !message?.attemptId) {
      this.logger.warn('Skipping malformed seller auction lifecycle event');
      return;
    }

    await this.lifecycleRepo.upsertSnapshot(message);
  }
}
