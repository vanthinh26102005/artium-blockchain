import { SellerAuctionStartStatusObject } from '@app/common';
import { EntityManager } from 'typeorm';

export const IArtworkAuctionLifecycleRepository = Symbol(
  'IArtworkAuctionLifecycleRepository',
);

export interface IArtworkAuctionLifecycleRepository {
  upsertSnapshot(
    lifecycle: SellerAuctionStartStatusObject,
    transactionManager?: EntityManager,
  ): Promise<void>;

  findBySellerAndArtworkIds(
    sellerId: string,
    artworkIds: string[],
    transactionManager?: EntityManager,
  ): Promise<SellerAuctionStartStatusObject[]>;
}
