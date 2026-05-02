import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { HttpException, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  SellerAuctionReservePolicy,
  SellerAuctionStartFailureReason,
  SellerAuctionStartStatus,
  SellerAuctionStartStatusObject,
} from '@app/common';
import { EscrowContractService } from '@app/blockchain';
import { ethers } from 'ethers';
import { StartSellerAuctionCommand } from '../StartSellerAuction.command';
import {
  AuctionStartAttempt,
  SellerAuctionStartTermsSnapshot,
} from '../../../domain/entities';
import { IAuctionStartAttemptRepository } from '../../../domain/interfaces';
import { SellerAuctionLifecycleOutboxService } from '../../services';

@CommandHandler(StartSellerAuctionCommand)
export class StartSellerAuctionHandler implements ICommandHandler<StartSellerAuctionCommand> {
  private readonly logger = new Logger(StartSellerAuctionHandler.name);

  constructor(
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    private readonly escrowContractService: EscrowContractService,
    private readonly configService: ConfigService,
    private readonly lifecycleOutbox: SellerAuctionLifecycleOutboxService,
  ) {}

  async execute(
    command: StartSellerAuctionCommand,
  ): Promise<SellerAuctionStartStatusObject> {
    try {
      const data = command.data;
      const walletAddress = this.normalizeWalletAddress(data.walletAddress);
      const contractAddress = this.getRequiredContractAddress();
      const termsSnapshot = this.buildTermsSnapshot(data);
      const reservePriceWei = this.toReservePriceWei(data);
      const minBidIncrementWei = this.toWeiString(
        data.minBidIncrementEth,
        'Minimum bid increment must be a valid ETH amount',
      );
      const durationSeconds = data.durationHours * 60 * 60;
      const existing = await this.startAttemptRepo.findLatestBySellerAndArtwork(
        data.sellerId,
        data.artworkId,
      );

      if (existing) {
        const reused = await this.handleExistingAttempt(
          existing,
          contractAddress,
          walletAddress,
          termsSnapshot,
          reservePriceWei,
          minBidIncrementWei,
          durationSeconds,
          data,
        );
        if (reused) {
          const snapshot = this.toStatusObject(reused);
          await this.lifecycleOutbox.queueSnapshot(snapshot);
          return snapshot;
        }
      }

      const created = await this.startAttemptRepo.create({
        sellerId: data.sellerId,
        artworkId: data.artworkId,
        orderId: this.generateOrderId(),
        status: SellerAuctionStartStatus.PENDING_START,
        artworkTitle: data.artworkTitle.trim(),
        creatorName: data.creatorName?.trim() || null,
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
        walletAddress,
        contractAddress,
        txHash: null,
        reasonCode: null,
        reasonMessage: null,
        retryAllowed: false,
        editAllowed: false,
        walletActionRequired: true,
        activatedAt: null,
        durationSeconds,
        reservePriceWei,
        minBidIncrementWei,
        ipfsMetadataHash: data.ipfsMetadataHash,
        termsSnapshot,
      });

      const snapshot = this.toStatusObject(created);
      await this.lifecycleOutbox.queueSnapshot(snapshot);
      return snapshot;
    } catch (error) {
      this.logger.error(
        'Failed to start seller auction',
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

  private async handleExistingAttempt(
    existing: AuctionStartAttempt,
    contractAddress: string,
    walletAddress: string,
    termsSnapshot: SellerAuctionStartTermsSnapshot,
    reservePriceWei: string,
    minBidIncrementWei: string,
    durationSeconds: number,
    data: StartSellerAuctionCommand['data'],
  ): Promise<AuctionStartAttempt | null> {
    if (
      existing.status === SellerAuctionStartStatus.PENDING_START ||
      existing.status === SellerAuctionStartStatus.AUCTION_ACTIVE
    ) {
      return existing;
    }

    if (existing.status === SellerAuctionStartStatus.RETRY_AVAILABLE) {
      return this.startAttemptRepo.update(existing.id, {
        status: SellerAuctionStartStatus.PENDING_START,
        walletActionRequired: true,
        retryAllowed: false,
        editAllowed: false,
        reasonCode: null,
        reasonMessage: null,
        contractAddress,
        walletAddress,
        txHash: null,
        termsSnapshot,
        reservePriceWei,
        minBidIncrementWei,
        durationSeconds,
        ipfsMetadataHash: data.ipfsMetadataHash,
      });
    }

    if (
      existing.status === SellerAuctionStartStatus.START_FAILED &&
      !existing.editAllowed
    ) {
      return existing;
    }

    return null;
  }

  private buildTermsSnapshot(
    data: StartSellerAuctionCommand['data'],
  ): SellerAuctionStartTermsSnapshot {
    return {
      reservePolicy: data.reservePolicy,
      reservePriceEth:
        data.reservePolicy === SellerAuctionReservePolicy.SET
          ? (data.reservePriceEth?.trim() ?? null)
          : null,
      minBidIncrementEth: data.minBidIncrementEth.trim(),
      durationHours: data.durationHours,
      shippingDisclosure: data.shippingDisclosure.trim(),
      paymentDisclosure: data.paymentDisclosure.trim(),
      economicsLockedAcknowledged: data.economicsLockedAcknowledged,
    };
  }

  private getRequiredContractAddress(): string {
    const contractAddress = this.configService
      .get<string>('CONTRACT_ADDRESS')
      ?.trim();
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL')?.trim();

    if (!contractAddress || !rpcUrl) {
      throw RpcExceptionHelper.conflict(
        'Blockchain contract configuration is required before starting an auction',
      );
    }

    return contractAddress;
  }

  private normalizeWalletAddress(address: string): string {
    if (!ethers.isAddress(address)) {
      throw RpcExceptionHelper.badRequest(
        'Seller wallet address must be a valid EVM address',
      );
    }
    return ethers.getAddress(address);
  }

  private toReservePriceWei(data: StartSellerAuctionCommand['data']): string {
    if (data.reservePolicy === SellerAuctionReservePolicy.NONE) {
      return '0';
    }
    return this.toWeiString(
      data.reservePriceEth ?? '',
      'Reserve price must be a valid ETH amount',
    );
  }

  private toWeiString(value: string, errorMessage: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      throw RpcExceptionHelper.badRequest(errorMessage);
    }
    try {
      return ethers.parseEther(trimmed).toString();
    } catch {
      throw RpcExceptionHelper.badRequest(errorMessage);
    }
  }

  private generateOrderId() {
    return `AUC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
