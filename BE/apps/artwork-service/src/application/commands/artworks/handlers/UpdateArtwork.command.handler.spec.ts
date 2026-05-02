import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus, SellerAuctionStartStatus } from '@app/common';
import { UpdateArtworkCommand } from '../UpdateArtwork.command';
import { UpdateArtworkHandler } from './UpdateArtwork.command.handler';

describe('UpdateArtworkHandler', () => {
  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const lifecycleRepo = {
    findBySellerAndArtworkId: jest.fn(),
  };

  const user = { id: 'seller-1' } as never;

  let handler: UpdateArtworkHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue(null as never);
    handler = new UpdateArtworkHandler(repo as never, lifecycleRepo as never);
  });

  it('updates a seller-owned artwork', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.INACTIVE,
    } as never);
    repo.update.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    } as never);

    const result = await handler.execute(
      new UpdateArtworkCommand(
        'artwork-1',
        {
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
        },
        user,
      ),
    );

    expect(lifecycleRepo.findBySellerAndArtworkId).toHaveBeenCalledWith(
      'seller-1',
      'artwork-1',
    );
    expect(repo.update).toHaveBeenCalledWith('artwork-1', {
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    });
    expect(result).toMatchObject({
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    });
  });

  it('rejects an update without an authenticated seller', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      handler.execute(
        new UpdateArtworkCommand('artwork-1', { isPublished: true }, undefined),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects an artwork owned by another seller', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-2',
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      handler.execute(
        new UpdateArtworkCommand('artwork-1', { isPublished: true }, user),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects pending auction lifecycle updates', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
    } as never);
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue({
      status: SellerAuctionStartStatus.PENDING_START,
      editAllowed: false,
    } as never);

    await expect(
      handler.execute(
        new UpdateArtworkCommand('artwork-1', { isPublished: false }, user),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('allows editable failed auction lifecycle updates', async () => {
    repo.findById.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
    } as never);
    lifecycleRepo.findBySellerAndArtworkId.mockResolvedValue({
      status: SellerAuctionStartStatus.START_FAILED,
      editAllowed: true,
    } as never);
    repo.update.mockResolvedValue({
      id: 'artwork-1',
      sellerId: 'seller-1',
      isPublished: false,
    } as never);

    await handler.execute(
      new UpdateArtworkCommand('artwork-1', { isPublished: false }, user),
    );

    expect(repo.update).toHaveBeenCalledWith('artwork-1', {
      isPublished: false,
    });
  });
});
