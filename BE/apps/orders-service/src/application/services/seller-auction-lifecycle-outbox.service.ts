import { EscrowContractService } from '@app/blockchain';
import {
  SellerAuctionStartStatus,
  SellerAuctionStartStatusObject,
} from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuctionStartAttempt } from '../../domain/entities';

@Injectable()
export class SellerAuctionLifecycleOutboxService {
  constructor(
    private readonly outboxService: OutboxService,
    private readonly escrowContractService: EscrowContractService,
  ) {}

  async queueAttemptSnapshot(
    attempt: AuctionStartAttempt,
    manager?: EntityManager,
  ): Promise<SellerAuctionStartStatusObject> {
    const snapshot = this.toStatusObject(attempt);
    await this.queueSnapshot(snapshot, manager);
    return snapshot;
  }

  async queueSnapshot(
    snapshot: SellerAuctionStartStatusObject,
    manager?: EntityManager,
  ): Promise<void> {
    await this.outboxService.createOutboxMessage(
      {
        aggregateType: 'seller-auction-start-attempt',
        aggregateId: snapshot.attemptId,
        eventType: 'SELLER_AUCTION_LIFECYCLE_UPDATED',
        payload: snapshot,
        exchange: ExchangeName.ORDER_EVENTS,
        routingKey: RoutingKey.SELLER_AUCTION_LIFECYCLE_UPDATED,
      },
      manager,
    );
  }

  toStatusObject(attempt: AuctionStartAttempt): SellerAuctionStartStatusObject {
    const shouldIncludeWalletRequest =
      attempt.walletActionRequired &&
      !attempt.txHash &&
      (attempt.status === SellerAuctionStartStatus.PENDING_START ||
        attempt.status === SellerAuctionStartStatus.RETRY_AVAILABLE);

    return {
      attemptId: attempt.id,
      sellerId: attempt.sellerId,
      artworkId: attempt.artworkId,
      orderId: attempt.orderId,
      status: attempt.status,
      artworkTitle: attempt.artworkTitle,
      creatorName: attempt.creatorName ?? null,
      thumbnailUrl: attempt.thumbnailUrl ?? null,
      contractAddress: attempt.contractAddress ?? null,
      txHash: attempt.txHash ?? null,
      walletAddress: attempt.walletAddress ?? null,
      reasonCode: attempt.reasonCode ?? null,
      reasonMessage: attempt.reasonMessage ?? null,
      retryAllowed: attempt.retryAllowed,
      editAllowed: attempt.editAllowed,
      walletActionRequired: attempt.walletActionRequired,
      submittedTermsSnapshot: attempt.termsSnapshot,
      activatedAt: attempt.activatedAt?.toISOString() ?? null,
      updatedAt: (
        attempt.updatedAt ??
        attempt.createdAt ??
        new Date()
      ).toISOString(),
      transactionRequest:
        shouldIncludeWalletRequest && attempt.contractAddress
          ? {
              contractAddress: attempt.contractAddress,
              data: this.escrowContractService.encodeCreateAuctionCalldata(
                attempt.orderId,
                BigInt(attempt.durationSeconds),
                BigInt(attempt.reservePriceWei),
                BigInt(attempt.minBidIncrementWei),
                attempt.ipfsMetadataHash,
              ),
            }
          : null,
    };
  }
}
