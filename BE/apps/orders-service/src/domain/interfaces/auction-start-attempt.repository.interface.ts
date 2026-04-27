import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { AuctionStartAttempt } from '../entities';

export const IAuctionStartAttemptRepository = Symbol('IAuctionStartAttemptRepository');

export interface IAuctionStartAttemptRepository
  extends IRepository<AuctionStartAttempt, string> {
  findLatestBySellerAndArtwork(
    sellerId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null>;

  findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null>;

  findByTxHash(
    txHash: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null>;
}
