import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus, SellerAuctionStartStatus } from '@app/common';
import { DeleteArtworkCommand } from '../DeleteArtwork.command';
import { DeleteArtworkHandler } from './DeleteArtwork.command.handler';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('DeleteArtworkHandler', () => {
  const repo = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  const lifecycleRepo = {
    findBySellerAndArtworkId: jest.fn(),
  };

  const gcsStorage = {
    deleteFiles: jest.fn(),
  };

  const user = { id: 'seller-1' } as never;

  let handler: DeleteArtworkHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue(null as never);
    handler = new DeleteArtworkHandler(
      repo as never,
      lifecycleRepo as never,
      gcsStorage as never,
    );
  });

  it('deletes a seller-owned artwork', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      images: [
        { publicId: 'artworks/seller-1/artwork-1/primary' },
        { publicId: 'artworks/seller-1/artwork-1/detail' },
      ],
    } as never);
    repo.delete.mockResolvedValue(true as never);
    gcsStorage.deleteFiles.mockResolvedValue(undefined as never);

    const result = await handler.execute(
      new DeleteArtworkCommand('artwork-1', user),
    );

    expect(lifecycleRepo.findBySellerAndArtworkId).toHaveBeenCalledWith(
      'seller-1',
      'artwork-1',
    );
    expect(gcsStorage.deleteFiles).toHaveBeenCalledWith([
      'artworks/seller-1/artwork-1/primary',
      'artworks/seller-1/artwork-1/detail',
    ]);
    expect(repo.delete).toHaveBeenCalledWith('artwork-1');
    expect(result).toBe(true);
  });

  it('rejects a delete without an authenticated seller', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      images: [],
    } as never);

    await expect(
      handler.execute(new DeleteArtworkCommand('artwork-1', undefined)),
    ).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('rejects an artwork owned by another seller', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-2',
      status: ArtworkStatus.ACTIVE,
      images: [],
    } as never);

    await expect(
      handler.execute(new DeleteArtworkCommand('artwork-1', user)),
    ).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('rejects active auction lifecycle deletion', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      images: [],
    } as never);
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue({
      status: SellerAuctionStartStatus.AUCTION_ACTIVE,
    } as never);

    await expect(
      handler.execute(new DeleteArtworkCommand('artwork-1', user)),
    ).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('rejects failed auction lifecycle deletion', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      images: [],
    } as never);
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue({
      status: SellerAuctionStartStatus.START_FAILED,
    } as never);

    await expect(
      handler.execute(new DeleteArtworkCommand('artwork-1', user)),
    ).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
