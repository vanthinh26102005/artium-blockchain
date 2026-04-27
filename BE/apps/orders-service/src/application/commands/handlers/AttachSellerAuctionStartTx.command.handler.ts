import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  SellerAuctionStartStatus,
  SellerAuctionStartStatusObject,
} from '@app/common';
import { EscrowContractService } from '@app/blockchain';
import { ethers } from 'ethers';
import { AttachSellerAuctionStartTxCommand } from '../AttachSellerAuctionStartTx.command';
import { AuctionStartAttempt } from '../../../domain/entities';
import { IAuctionStartAttemptRepository } from '../../../domain/interfaces';

@CommandHandler(AttachSellerAuctionStartTxCommand)
export class AttachSellerAuctionStartTxHandler
  implements ICommandHandler<AttachSellerAuctionStartTxCommand>
{
  private readonly logger = new Logger(AttachSellerAuctionStartTxHandler.name);

  constructor(
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    private readonly escrowContractService: EscrowContractService,
  ) {}

  async execute(
    command: AttachSellerAuctionStartTxCommand,
  ): Promise<SellerAuctionStartStatusObject> {
    try {
      const attempt = await this.startAttemptRepo.findById(command.attemptId);
      if (!attempt || attempt.sellerId !== command.sellerId) {
        throw RpcExceptionHelper.notFound('Auction start attempt not found');
      }

      const walletAddress = this.normalizeWalletAddress(command.walletAddress);
      if (attempt.walletAddress && attempt.walletAddress !== walletAddress) {
        throw RpcExceptionHelper.conflict(
          'Connected wallet does not match the seller wallet bound to this auction start',
        );
      }

      if (attempt.txHash && attempt.txHash !== command.txHash) {
        throw RpcExceptionHelper.conflict(
          'A different transaction hash is already attached to this auction start',
        );
      }

      const existingByTxHash = await this.startAttemptRepo.findByTxHash(command.txHash);
      if (existingByTxHash && existingByTxHash.id !== attempt.id) {
        throw RpcExceptionHelper.conflict(
          'This transaction hash is already attached to another auction start',
        );
      }

      const updated = await this.startAttemptRepo.update(attempt.id, {
        txHash: command.txHash,
        walletAddress,
        walletActionRequired: false,
        status:
          attempt.status === SellerAuctionStartStatus.RETRY_AVAILABLE
            ? SellerAuctionStartStatus.PENDING_START
            : attempt.status,
      });

      if (!updated) {
        throw RpcExceptionHelper.internalError(
          'Failed to persist the seller auction start transaction',
        );
      }

      return this.toStatusObject(updated);
    } catch (error) {
      this.logger.error(
        'Failed to attach seller auction start tx',
        (error as Error).stack,
      );
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError((error as Error).message);
    }
  }

  private normalizeWalletAddress(address: string): string {
    if (!ethers.isAddress(address)) {
      throw RpcExceptionHelper.badRequest('Seller wallet address must be a valid EVM address');
    }
    return ethers.getAddress(address);
  }

  private toStatusObject(
    attempt: AuctionStartAttempt,
  ): SellerAuctionStartStatusObject {
    const shouldIncludeWalletRequest =
      attempt.status === SellerAuctionStartStatus.PENDING_START ||
      attempt.status === SellerAuctionStartStatus.RETRY_AVAILABLE;

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
      updatedAt: (attempt.updatedAt ?? attempt.createdAt ?? new Date()).toISOString(),
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
