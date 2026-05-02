import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import {
  CommunityMediaStatus,
  CommunityMediaType,
  CommunityMediaUploadContext,
} from '@app/common';
import { CreateMoodboardCommand } from '../CreateMoodboard.command';
import { CreateMoodboardHandler } from './CreateMoodboard.command.handler';

const makeMedia = (overrides: Record<string, unknown> = {}) => ({
  id: 'media-1',
  ownerId: 'user-1',
  uploadContext: CommunityMediaUploadContext.MOODBOARD,
  mediaType: CommunityMediaType.IMAGE,
  mimeType: 'image/jpeg',
  storagePath: 'community/user-1/moodboards/media.jpg',
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

describe('CreateMoodboardHandler', () => {
  let moodboardRepository: any;
  let communityMediaRepository: any;
  let moodboardMediaRepository: any;
  let transactionService: any;
  let handler: CreateMoodboardHandler;

  beforeEach(() => {
    moodboardRepository = {
      create: jest.fn(async (data: any) => ({
        id: 'moodboard-1',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        ...data,
      })),
    };

    communityMediaRepository = {
      findByIds: jest.fn(async () => [
        makeMedia({ id: 'media-1', url: 'https://storage.test/media-1.jpg' }),
        makeMedia({
          id: 'media-2',
          url: 'https://storage.test/media-2.jpg',
          mediaType: CommunityMediaType.VIDEO,
          durationSeconds: 24,
        }),
      ]),
      markConsumed: jest.fn(async (id: string) =>
        makeMedia({
          id,
          status: CommunityMediaStatus.CONSUMED,
          consumedByType: 'moodboard',
          consumedById: 'moodboard-1',
        }),
      ),
    };

    moodboardMediaRepository = {
      createManyForMoodboard: jest.fn(
        async (_moodboardId: string, items: any[]) =>
          items.map((item, index) => ({
            id: `row-${index + 1}`,
            ...item,
          })),
      ),
    };

    transactionService = {
      execute: jest.fn(async (work: any) => work({})),
    };

    handler = new CreateMoodboardHandler(
      moodboardRepository,
      communityMediaRepository,
      moodboardMediaRepository,
      transactionService,
    );
  });

  it('creates a moodboard with uploaded media items', async () => {
    const result = await handler.execute(
      new CreateMoodboardCommand({
        userId: 'user-1',
        title: 'Studio board',
        mediaIds: ['media-1', 'media-2'],
      }),
    );

    expect(communityMediaRepository.findByIds).toHaveBeenCalledWith([
      'media-1',
      'media-2',
    ]);
    expect(moodboardRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        title: 'Studio board',
        coverImageUrl: 'https://storage.test/media-1.jpg',
      }),
      {},
    );
    expect(
      moodboardMediaRepository.createManyForMoodboard,
    ).toHaveBeenCalledWith(
      'moodboard-1',
      expect.arrayContaining([
        expect.objectContaining({
          communityMediaId: 'media-1',
          displayOrder: 0,
          isCover: true,
        }),
        expect.objectContaining({
          communityMediaId: 'media-2',
          displayOrder: 1,
          isCover: false,
        }),
      ]),
      {},
    );
    expect(communityMediaRepository.markConsumed).toHaveBeenCalledWith(
      'media-1',
      'moodboard',
      'moodboard-1',
      {},
    );
    expect(result).toMatchObject({
      id: 'moodboard-1',
      coverImageUrl: 'https://storage.test/media-1.jpg',
    });
  });

  it('derives cover image from coverMediaId', async () => {
    await handler.execute(
      new CreateMoodboardCommand({
        userId: 'user-1',
        title: 'Cover board',
        mediaIds: ['media-1', 'media-2'],
        coverMediaId: 'media-2',
      }),
    );

    expect(moodboardRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImageUrl: 'https://storage.test/media-2.jpg',
      }),
      {},
    );
    expect(
      moodboardMediaRepository.createManyForMoodboard,
    ).toHaveBeenCalledWith(
      'moodboard-1',
      expect.arrayContaining([
        expect.objectContaining({
          communityMediaId: 'media-2',
          isCover: true,
        }),
      ]),
      {},
    );
  });

  it('rejects moodboard media owned by another user', async () => {
    communityMediaRepository.findByIds.mockResolvedValueOnce([
      makeMedia({ id: 'media-1', ownerId: 'user-2' }),
    ]);

    await expect(
      handler.execute(
        new CreateMoodboardCommand({
          userId: 'user-1',
          title: 'Wrong owner',
          mediaIds: ['media-1'],
        }),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'Uploaded moodboard media does not belong to the current user',
      }),
    });
    expect(transactionService.execute).not.toHaveBeenCalled();
    expect(moodboardRepository.create).not.toHaveBeenCalled();
  });

  it('rejects coverMediaId outside mediaIds', async () => {
    await expect(
      handler.execute(
        new CreateMoodboardCommand({
          userId: 'user-1',
          title: 'Bad cover',
          mediaIds: ['media-1'],
          coverMediaId: 'media-2',
        }),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'coverMediaId must be included in mediaIds',
      }),
    });
    expect(communityMediaRepository.findByIds).not.toHaveBeenCalled();
  });

  it('persists uploaded moodboard media order', async () => {
    await handler.execute(
      new CreateMoodboardCommand({
        userId: 'user-1',
        title: 'Ordered board',
        mediaIds: ['media-2', 'media-1'],
      }),
    );

    expect(
      moodboardMediaRepository.createManyForMoodboard,
    ).toHaveBeenCalledWith(
      'moodboard-1',
      [
        expect.objectContaining({
          communityMediaId: 'media-2',
          displayOrder: 0,
        }),
        expect.objectContaining({
          communityMediaId: 'media-1',
          displayOrder: 1,
        }),
      ],
      {},
    );
  });
});
