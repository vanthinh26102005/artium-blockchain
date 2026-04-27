import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus } from '@app/common';
import { MarkArtworkInAuctionCommand } from '../MarkArtworkInAuction.command';
import { MarkArtworkInAuctionHandler } from './MarkArtworkInAuction.command.handler';

describe('MarkArtworkInAuctionHandler', () => {
  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  let handler: MarkArtworkInAuctionHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new MarkArtworkInAuctionHandler(repo as never);
  });

  it('marks artwork in auction with authoritative on-chain linkage', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      onChainAuctionId: null,
    } as never);
    repo.update.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: 'AUC-001',
    } as never);

    const result = await handler.execute(
      new MarkArtworkInAuctionCommand('artwork-1', 'seller-1', 'AUC-001'),
    );

    expect(repo.update).toHaveBeenCalledWith('artwork-1', {
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: 'AUC-001',
    });
    expect(result).toMatchObject({
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: 'AUC-001',
    });
  });

  it('is idempotent when the artwork is already linked to the same auction', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: 'AUC-001',
    } as never);

    const result = await handler.execute(
      new MarkArtworkInAuctionCommand('artwork-1', 'seller-1', 'AUC-001'),
    );

    expect(repo.update).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: 'AUC-001',
    });
  });
});
