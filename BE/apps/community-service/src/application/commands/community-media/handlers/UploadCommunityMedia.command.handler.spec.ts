import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import {
  CommunityMediaStatus,
  CommunityMediaType,
  CommunityMediaUploadContext,
} from '@app/common';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  UploadCommunityMomentMediaHandler,
  UploadCommunityMoodboardMediaHandler,
} from './UploadCommunityMedia.command.handler';
import { UploadCommunityMomentMediaCommand } from '../UploadCommunityMomentMedia.command';
import { UploadCommunityMoodboardMediaCommand } from '../UploadCommunityMoodboardMedia.command';

const makeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    originalname: 'media.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('file'),
    fieldname: 'file',
    encoding: '7bit',
    destination: '',
    filename: '',
    path: '',
    stream: undefined as any,
    ...overrides,
  }) as Express.Multer.File;

describe('UploadCommunityMedia handlers', () => {
  let repository: any;
  let storage: any;
  let momentHandler: UploadCommunityMomentMediaHandler;
  let moodboardHandler: UploadCommunityMoodboardMediaHandler;

  beforeEach(() => {
    storage = {
      uploadFile: jest.fn(async (file: Express.Multer.File, options: any) => ({
        id: 'upload-id',
        publicId: `${options.context}/${file.originalname}`,
        url: `https://storage.test/${options.context}/${file.originalname}`,
        secureUrl: `https://storage.test/${options.context}/${file.originalname}`,
        path: `community/${options.userId}/${options.context}s/${file.originalname}`,
        format: file.originalname.split('.').pop(),
        size: file.size,
        bucket: 'bucket',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
      })),
    };

    repository = {
      create: jest.fn(async (data: any) => ({
        id: 'media-id',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        ...data,
      })),
    };

    momentHandler = new UploadCommunityMomentMediaHandler(repository, storage);
    moodboardHandler = new UploadCommunityMoodboardMediaHandler(
      repository,
      storage,
    );
  });

  it('rejects missing moment media', async () => {
    await expect(
      momentHandler.execute(
        new UploadCommunityMomentMediaCommand('user-1', undefined as any),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({ message: 'No file provided' }),
    });
  });

  it('rejects moodboard batches over ten files', async () => {
    const files = Array.from({ length: 11 }, (_, index) =>
      makeFile({ originalname: `media-${index}.jpg` }),
    );

    await expect(
      moodboardHandler.execute(
        new UploadCommunityMoodboardMediaCommand('user-1', files),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: 'Maximum 10 files allowed per moodboard upload',
      }),
    });
  });

  it('rejects unsupported MIME types', async () => {
    await expect(
      momentHandler.execute(
        new UploadCommunityMomentMediaCommand(
          'user-1',
          makeFile({ mimetype: 'application/pdf', originalname: 'doc.pdf' }),
        ),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: expect.stringContaining('Invalid file type'),
      }),
    });
  });

  it('rejects oversized images and videos', async () => {
    await expect(
      momentHandler.execute(
        new UploadCommunityMomentMediaCommand(
          'user-1',
          makeFile({ size: MAX_IMAGE_SIZE_BYTES + 1 }),
        ),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: expect.stringContaining('Image size exceeds'),
      }),
    });

    await expect(
      momentHandler.execute(
        new UploadCommunityMomentMediaCommand(
          'user-1',
          makeFile({
            mimetype: 'video/mp4',
            originalname: 'clip.mp4',
            size: MAX_VIDEO_SIZE_BYTES + 1,
          }),
        ),
      ),
    ).rejects.toMatchObject({
      error: expect.objectContaining({
        message: expect.stringContaining('Video size exceeds'),
      }),
    });
  });

  it('stores pending owned media metadata', async () => {
    const result = await momentHandler.execute(
      new UploadCommunityMomentMediaCommand(
        'user-1',
        makeFile({
          mimetype: 'video/mp4',
          originalname: 'clip.mp4',
          size: 2048,
        }),
        30,
      ),
    );

    expect(storage.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ originalname: 'clip.mp4' }),
      expect.objectContaining({
        userId: 'user-1',
        context: CommunityMediaUploadContext.MOMENT,
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'user-1',
        uploadContext: CommunityMediaUploadContext.MOMENT,
        mediaType: CommunityMediaType.VIDEO,
        status: CommunityMediaStatus.PENDING,
        originalFilename: 'clip.mp4',
        durationSeconds: 30,
      }),
    );
    expect(result).toMatchObject({
      mediaId: 'media-id',
      mediaType: CommunityMediaType.VIDEO,
      status: CommunityMediaStatus.PENDING,
      originalFilename: 'clip.mp4',
      durationSeconds: 30,
    });
  });
});
