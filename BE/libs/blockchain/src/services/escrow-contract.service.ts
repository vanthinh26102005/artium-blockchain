import { Injectable, Logger, Inject } from '@nestjs/common';
import { ethers, Contract, TransactionResponse } from 'ethers';
import { EscrowState } from '@app/common';
import { ESCROW_CONTRACT, PLATFORM_SIGNER } from '../interfaces/blockchain-config.interface';

export interface AuctionCoreDto {
  seller: string;
  highestBidder: string;
  highestBid: bigint;
  startTime: bigint;
  endTime: bigint;
  minBidIncrement: bigint;
  ipfsHash: string;
  state: EscrowState;
}

export interface AuctionTimelineDto {
  trackingHash: string;
  shippingDeadline: bigint;
  deliveryDeadline: bigint;
  disputeDeadline: bigint;
  reservePrice: bigint;
}

@Injectable()
export class EscrowContractService {
  private readonly logger = new Logger(EscrowContractService.name);

  constructor(
    @Inject(ESCROW_CONTRACT)
    private readonly contract: Contract,
    @Inject(PLATFORM_SIGNER)
    private readonly signer: ethers.Wallet,
  ) {}

  async getAuction(orderId: string): Promise<AuctionCoreDto> {
    this.logger.debug(`Fetching auction: ${orderId}`);
    const result = await this.contract.getAuction(orderId);

    return {
      seller: result.seller,
      highestBidder: result.highestBidder,
      highestBid: result.highestBid,
      startTime: result.startTime,
      endTime: result.endTime,
      minBidIncrement: result.minBidIncrement,
      ipfsHash: result.ipfsHash,
      state: Number(result.state) as EscrowState,
    };
  }

  async getAuctionTimeline(orderId: string): Promise<AuctionTimelineDto> {
    this.logger.debug(`Fetching auction timeline: ${orderId}`);
    const result = await this.contract.getAuctionTimeline(orderId);

    return {
      trackingHash: result.trackingHash,
      shippingDeadline: result.shippingDeadline,
      deliveryDeadline: result.deliveryDeadline,
      disputeDeadline: result.disputeDeadline,
      reservePrice: result.reservePrice,
    };
  }

  async getPendingReturns(address: string): Promise<bigint> {
    this.logger.debug(`Fetching pending returns for: ${address}`);
    return this.contract.pendingReturns(address);
  }

  async getPlatformFeeBps(): Promise<number> {
    const fee = await this.contract.platformFeeBps();
    return Number(fee);
  }

  encodeCreateAuctionCalldata(
    orderId: string,
    duration: bigint,
    reservePrice: bigint,
    minBidIncrement: bigint,
    ipfsHash: string,
  ): string {
    return this.contract.interface.encodeFunctionData('createAuction', [
      orderId,
      duration,
      reservePrice,
      minBidIncrement,
      ipfsHash,
    ]);
  }

  async createAuction(
    orderId: string,
    duration: bigint,
    reservePrice: bigint,
    minBidIncrement: bigint,
    ipfsHash: string,
  ): Promise<TransactionResponse> {
    this.logger.log(`Creating auction on-chain: ${orderId}`);
    const contractWithSigner = this.contract.connect(this.signer) as Contract;

    return contractWithSigner.createAuction(
      orderId,
      duration,
      reservePrice,
      minBidIncrement,
      ipfsHash,
    );
  }
}
