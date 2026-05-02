import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus } from '@app/common';
import { SaveArtworkDraftCommand } from '../SaveArtworkDraft.command';
import { SaveArtworkDraftHandler } from './SaveArtworkDraft.command.handler';

describe('SaveArtworkDraftHandler', () => {
  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const user = { id: 'seller-1' } as never;

  let handler: SaveArtworkDraftHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new SaveArtworkDraftHandler(repo as never);
  });

  it('updates a seller-owned draft', async () => {
    repo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.DRAFT,
      isPublished: false,
    } as never);
    repo.update.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-1',
      title: 'Ocean Study',
      status: ArtworkStatus.DRAFT,
      isPublished: false,
    } as never);

    const result = await handler.execute(
      new SaveArtworkDraftCommand(
        'draft-1',
        {
          title: 'Ocean Study',
          creatorName: 'Actual Seller',
          status: ArtworkStatus.ACTIVE,
          isPublished: true,
        },
        user,
      ),
    );

    expect(repo.update).toHaveBeenCalledWith(
      'draft-1',
      expect.objectContaining({
        title: 'Ocean Study',
        creatorName: 'Actual Seller',
        sellerId: 'seller-1',
        status: ArtworkStatus.DRAFT,
        isPublished: false,
      }),
    );
    expect(result).toMatchObject({
      id: 'draft-1',
      title: 'Ocean Study',
      status: ArtworkStatus.DRAFT,
    });
  });

  it('rejects a missing draft', async () => {
    repo.findById.mockResolvedValue(null as never);

    await expect(
      handler.execute(new SaveArtworkDraftCommand('draft-1', {}, user)),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects a draft owned by another seller', async () => {
    repo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-2',
      status: ArtworkStatus.DRAFT,
    } as never);

    await expect(
      handler.execute(new SaveArtworkDraftCommand('draft-1', {}, user)),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects a non-draft artwork', async () => {
    repo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      handler.execute(new SaveArtworkDraftCommand('draft-1', {}, user)),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });
});
