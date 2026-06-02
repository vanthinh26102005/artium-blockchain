import { EntityManager } from 'typeorm';
import { WalletOwnership } from '../entities';

export const IWalletOwnershipRepository = Symbol('IWalletOwnershipRepository');

export interface IWalletOwnershipRepository {
  findByWalletAddress(
    walletAddress: string,
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership | null>;

  findActiveUserIdByWalletAddress(
    walletAddress: string,
    transactionManager?: EntityManager,
  ): Promise<string | null>;

  recordLinked(
    data: {
      walletAddress: string;
      userId: string;
      occurredAt: Date;
    },
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership>;

  recordUnlinked(
    data: {
      walletAddress: string;
      userId: string;
      occurredAt: Date;
    },
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership | null>;
}
