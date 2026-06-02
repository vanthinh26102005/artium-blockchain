import { Inject, Injectable } from '@nestjs/common';
import { IWalletOwnershipRepository } from '../../domain/interfaces';

@Injectable()
export class AuctionBuyerIdentityService {
  constructor(
    @Inject(IWalletOwnershipRepository)
    private readonly walletOwnershipRepo: IWalletOwnershipRepository,
  ) {}

  normalizeWalletAddress(value?: string | null): string | null {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim().toLowerCase()
      : null;
  }

  async resolveCollectorIdByWallet(
    walletAddress?: string | null,
  ): Promise<string | null> {
    const normalizedWallet = this.normalizeWalletAddress(walletAddress);
    if (!normalizedWallet) {
      return null;
    }

    return this.walletOwnershipRepo.findActiveUserIdByWalletAddress(
      normalizedWallet,
    );
  }
}
