import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { IWalletOwnershipRepository } from '../../domain/interfaces';
import { AuctionBuyerIdentityService } from '../services';

type WalletOwnershipMessage = {
  userId: string;
  walletAddress: string;
  occurredAt: string;
};

type ParsedWalletOwnershipMessage = {
  userId: string;
  walletAddress: string;
  occurredAt: Date;
};

@Injectable()
export class WalletOwnershipEventHandler {
  private readonly logger = new Logger(WalletOwnershipEventHandler.name);

  constructor(
    @Inject(IWalletOwnershipRepository)
    private readonly walletOwnershipRepo: IWalletOwnershipRepository,
    private readonly buyerIdentity: AuctionBuyerIdentityService,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_WALLET_LINKED,
    queue: 'orders-service.identity.wallet-linked',
    queueOptions: { durable: true },
  })
  async handleWalletLinked(message: WalletOwnershipMessage) {
    const parsed = this.parseMessage(message);
    if (!parsed) {
      return;
    }

    await this.walletOwnershipRepo.recordLinked(parsed);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_WALLET_UNLINKED,
    queue: 'orders-service.identity.wallet-unlinked',
    queueOptions: { durable: true },
  })
  async handleWalletUnlinked(message: WalletOwnershipMessage) {
    const parsed = this.parseMessage(message);
    if (!parsed) {
      return;
    }

    await this.walletOwnershipRepo.recordUnlinked(parsed);
  }

  private parseMessage(
    message: WalletOwnershipMessage,
  ): ParsedWalletOwnershipMessage | null {
    const walletAddress = this.buyerIdentity.normalizeWalletAddress(
      message.walletAddress,
    );
    const occurredAt = new Date(message.occurredAt);

    if (
      !message.userId ||
      !walletAddress ||
      Number.isNaN(occurredAt.getTime())
    ) {
      this.logger.warn(
        `Ignoring invalid wallet ownership event: ${JSON.stringify(message)}`,
      );
      return null;
    }

    return {
      userId: message.userId,
      walletAddress,
      occurredAt,
    };
  }
}
