import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  SellerAuctionStartStatus,
  SellerAuctionStartStatusObject,
} from '@app/common';
import { EscrowContractService } from '@app/blockchain';
import { GetSellerAuctionStartStatusQuery } from '../GetSellerAuctionStartStatus.query';
import { AuctionStartAttempt } from '../../../domain/entities';
import { IAuctionStartAttemptRepository } from '../../../domain/interfaces';

@QueryHandler(GetSellerAuctionStartStatusQuery)
export class GetSellerAuctionStartStatusHandler implements IQueryHandler<GetSellerAuctionStartStatusQuery> {
  private readonly logger = new Logger(GetSellerAuctionStartStatusHandler.name);

  constructor(
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    private readonly escrowContractService: EscrowContractService,
  ) {}

  async execute(
    query: GetSellerAuctionStartStatusQuery,
  ): Promise<SellerAuctionStartStatusObject | null> {
    this.logger.debug('Getting seller auction start status', {
      sellerId: query.sellerId,
      artworkId: query.artworkId,
    });

    const attempt = await this.startAttemptRepo.findLatestBySellerAndArtwork(
      query.sellerId,
      query.artworkId,
    );
    if (!attempt) {
      return null;
    }

    return this.toStatusObject(attempt);
  }

  private toStatusObject(
    attempt: AuctionStartAttempt,
  ): SellerAuctionStartStatusObject {
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
