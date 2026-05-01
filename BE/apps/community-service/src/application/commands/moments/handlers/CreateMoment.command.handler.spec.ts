import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import {
  CommunityMediaStatus,
  CommunityMediaType,
  CommunityMediaUploadContext,
} from '@app/common';
import { CreateMomentCommand } from '../CreateMoment.command';
import { CreateMomentHandler } from './CreateMoment.command.handler';

const makeMedia = (overrides: Record<string, unknown> = {}) => ({
  id: 'media-1',
  ownerId: 'user-1',
  uploadContext: CommunityMediaUploadContext.MOMENT,
  mediaType: CommunityMediaType.IMAGE,
  mimeType: 'image/jpeg',
  storagePath: 'community/user-1/moments/media.jpg',
  url: 'https://storage.test/media.jpg',
  secureUrl: 'https://storage.test/media.jpg',
  originalFilename: 'media.jpg',
  size: 1024,
  status: CommunityMediaStatus.PENDING,
  durationSeconds: null,
  thumbnailUrl: null,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  ...overrides,
});

describe('CreateMomentHandler', () => {
  let momentRepository: any;
  let communityMediaRepository: any;
  let handler: CreateMomentHandler;

  beforeEach(() => {
    momentRepository = {
      create: jest.fn(async (data: any) => ({
        id: 'moment-1',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        ...data,
      })),
    };

    communityMediaRepository = {
      findById: jest.fn(async () => makeMedia()),
      markConsumed: jest.fn(async () => makeMedia({
        status: CommunityMediaStatus.CONSUMED,
        consumedByType: 'moment',
        consumedById: 'moment-1',
      })),
    };

    handler = new CreateMomentHandler(
      momentRepository,
      communityMediaRepository,
    );
  });

  it('creates a moment from owner uploaded media', async () => {
    const result = await handler.execute(
      new CreateMomentCommand({
        userId: 'user-1',
        mediaId: 'media-1',
        caption: 'Fresh upload',
        isPinned: true,
        location: 'Ho Chi Minh City',
        hashtags: ['art'],
      }),
    );

    expect(communityMediaRepository.findById).toHaveBeenCalledWith('media-1');
    expect(momentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        mediaUrl: 'https://storage.test/media.jpg',
        mediaType: CommunityMediaType.IMAGE,
        thumbnailUrl: null,
        durationSeconds: null,
        caption: 'Fresh upload',
        isPinned: true,
      }),
    );
    expect(communityMediaRepository.markConsumed).toHaveBeenCalledWith(
      'media-1',
      'moment',
      'moment-1',
    );
    expect(result).toMatchObject({
      id: 'moment-1',
      mediaUrl: 'https://storage.test/media.jpg',
      mediaType: CommunityMediaType.IMAGE,
    });
  });

  it('rejects moment media owned by another user', async () => {
    communityMediaRepository.findById.mockResolvedValueOnce(
      makeMedia({ ownerId: 'user-2' }),
    );

    await expect(
      handler.execute(
        new CreateMomentCommand({
          userId: 'user-1',
          mediaId: 'media-1',
        }),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'Uploaded media does not belong to the current user',
      }),
    });
    expect(momentRepository.create).not.toHaveBeenCalled();
    expect(communityMediaRepository.markConsumed).not.toHaveBeenCalled();
  });

  it('rejects consumed moment media', async () => {
    communityMediaRepository.findById.mockResolvedValueOnce(
      makeMedia({ status: CommunityMediaStatus.CONSUMED }),
    );

    await expect(
      handler.execute(
        new CreateMomentCommand({
          userId: 'user-1',
          mediaId: 'media-1',
        }),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'Uploaded media is not pending',
      }),
    });
    expect(momentRepository.create).not.toHaveBeenCalled();
  });

  it('does not accept arbitrary mediaUrl proof', async () => {
    await expect(
      handler.execute(
        new CreateMomentCommand({
          userId: 'user-1',
          mediaUrl: 'https://example.test/arbitrary.jpg',
        } as any),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'Uploaded media ID is required',
      }),
    });
    expect(communityMediaRepository.findById).not.toHaveBeenCalled();
    expect(momentRepository.create).not.toHaveBeenCalled();
  });
});
