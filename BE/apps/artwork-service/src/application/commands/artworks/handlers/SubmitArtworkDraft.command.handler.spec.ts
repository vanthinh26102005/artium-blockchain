import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus } from '@app/common';
import { SubmitArtworkDraftCommand } from '../SubmitArtworkDraft.command';
import { SubmitArtworkDraftHandler } from './SubmitArtworkDraft.command.handler';

describe('SubmitArtworkDraftHandler', () => {
  const repo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const user = { id: 'seller-1' } as never;

  const baseDraft = {
    id: 'draft-1',
    sellerId: 'seller-1',
    title: 'Ocean Study',
    creationYear: 2024,
    dimensions: { height: 40, width: 50, unit: 'cm' },
    price: '1000.00',
    quantity: 1,
    status: ArtworkStatus.DRAFT,
    isPublished: false,
    images: [
      {
        id: 'image-1',
        publicId: 'artworks/draft-1/image.webp',
        url: 'https://example.com/image.webp',
        secureUrl: 'https://example.com/image.webp',
        isPrimary: true,
      },
    ],
  };

  let handler: SubmitArtworkDraftHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new SubmitArtworkDraftHandler(repo as never);
  });

  it('submits a sale draft as active and published', async () => {
    repo.findById.mockResolvedValue(baseDraft as never);
    repo.update.mockResolvedValue({
      ...baseDraft,
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    } as never);

    const result = await handler.execute(
      new SubmitArtworkDraftCommand(
        'draft-1',
        { listingStatus: 'sale', price: '1200.00', quantity: 2 },
        user,
      ),
    );

    expect(repo.update).toHaveBeenCalledWith('draft-1', {
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
      price: '1200.00',
      quantity: 2,
      sellerId: 'seller-1',
    });
    expect(result).toMatchObject({
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
    });
  });

  it('rejects submit with missing title', async () => {
    repo.findById.mockResolvedValue({
      ...baseDraft,
      title: '  ',
    } as never);

    await expect(
      handler.execute(
        new SubmitArtworkDraftCommand(
          'draft-1',
          { listingStatus: 'sale', price: '1200.00', quantity: 1 },
          user,
        ),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects submit without a primary image', async () => {
    repo.findById.mockResolvedValue({
      ...baseDraft,
      images: [{ ...baseDraft.images[0], isPrimary: false }],
    } as never);

    await expect(
      handler.execute(
        new SubmitArtworkDraftCommand(
          'draft-1',
          { listingStatus: 'sale', price: '1200.00', quantity: 1 },
          user,
        ),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects a draft owned by another seller', async () => {
    repo.findById.mockResolvedValue({
      ...baseDraft,
      sellerId: 'seller-2',
    } as never);

    await expect(
      handler.execute(
        new SubmitArtworkDraftCommand(
          'draft-1',
          { listingStatus: 'sale', price: '1200.00', quantity: 1 },
          user,
        ),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects a non-draft artwork', async () => {
    repo.findById.mockResolvedValue({
      ...baseDraft,
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      handler.execute(
        new SubmitArtworkDraftCommand(
          'draft-1',
          { listingStatus: 'sale', price: '1200.00', quantity: 1 },
          user,
        ),
      ),
    ).rejects.toThrow();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('maps inquire drafts to inactive unpublished artworks', async () => {
    repo.findById.mockResolvedValue(baseDraft as never);
    repo.update.mockResolvedValue({
      ...baseDraft,
      status: ArtworkStatus.INACTIVE,
      isPublished: false,
    } as never);

    const result = await handler.execute(
      new SubmitArtworkDraftCommand(
        'draft-1',
        { listingStatus: 'inquire' },
        user,
      ),
    );

    expect(repo.update).toHaveBeenCalledWith('draft-1', {
      status: ArtworkStatus.INACTIVE,
      isPublished: false,
      price: baseDraft.price,
      quantity: baseDraft.quantity,
      sellerId: 'seller-1',
    });
    expect(result).toMatchObject({
      status: ArtworkStatus.INACTIVE,
      isPublished: false,
    });
  });
});
