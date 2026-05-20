import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  SellerAuctionStartStatus,
  SellerAuctionStartStatusObject,
} from '@app/common';
import { EscrowContractService } from '@app/blockchain';
import { GetSellerAuctionStartStatusesQuery } from '../GetSellerAuctionStartStatuses.query';
import { AuctionStartAttempt } from '../../../domain/entities';
import { IAuctionStartAttemptRepository } from '../../../domain/interfaces';

@QueryHandler(GetSellerAuctionStartStatusesQuery)
export class GetSellerAuctionStartStatusesHandler
  implements IQueryHandler<GetSellerAuctionStartStatusesQuery>
{
  private readonly logger = new Logger(GetSellerAuctionStartStatusesHandler.name);

  constructor(
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    private readonly escrowContractService: EscrowContractService,
  ) {}

  async execute(
    query: GetSellerAuctionStartStatusesQuery,
  ): Promise<SellerAuctionStartStatusObject[]> {
    this.logger.debug('Getting seller auction start statuses', {
      sellerId: query.sellerId,
    });

    const attempts = await this.startAttemptRepo.find({
      where: { sellerId: query.sellerId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return attempts.map((attempt) => this.toStatusObject(attempt));
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
      submittedTermsSnapshot: {
        ...attempt.termsSnapshot,
        durationSeconds:
          attempt.termsSnapshot.durationSeconds ?? attempt.durationSeconds,
        durationHours:
          attempt.termsSnapshot.durationHours ??
          attempt.durationSeconds / (60 * 60),
      },
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
