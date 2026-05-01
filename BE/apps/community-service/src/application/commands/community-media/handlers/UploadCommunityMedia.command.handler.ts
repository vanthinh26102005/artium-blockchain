import {
  CommunityMediaStatus,
  CommunityMediaType,
  CommunityMediaUploadContext,
  CommunityMediaUploadResponseDto,
  RpcExceptionHelper,
} from '@app/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UploadCommunityMomentMediaCommand } from '../UploadCommunityMomentMedia.command';
import { UploadCommunityMoodboardMediaCommand } from '../UploadCommunityMoodboardMedia.command';
import {
  CommunityMedia,
  CommunityMediaStorageService,
  ICommunityMediaRepository,
} from '../../../../domain';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_MOODBOARD_FILES = 10;
export const MAX_VIDEO_DURATION_SECONDS = 60;

@CommandHandler(UploadCommunityMomentMediaCommand)
export class UploadCommunityMomentMediaHandler
  implements
    ICommandHandler<
      UploadCommunityMomentMediaCommand,
      CommunityMediaUploadResponseDto
    >
{
  private readonly logger = new Logger(UploadCommunityMomentMediaHandler.name);

  constructor(
    @Inject(ICommunityMediaRepository)
    private readonly communityMediaRepository: ICommunityMediaRepository,
    private readonly communityMediaStorage: CommunityMediaStorageService,
  ) {}

  async execute(
    command: UploadCommunityMomentMediaCommand,
  ): Promise<CommunityMediaUploadResponseDto> {
    if (!command.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }
    if (!command.file) {
      throw RpcExceptionHelper.badRequest('No file provided');
    }

    const mediaType = validateFile(command.file, command.durationSeconds);
    const media = await uploadAndPersistMedia({
      repository: this.communityMediaRepository,
      storage: this.communityMediaStorage,
      userId: command.userId,
      file: command.file,
      uploadContext: CommunityMediaUploadContext.MOMENT,
      mediaType,
      durationSeconds: resolveDuration(
        command.file,
        command.durationSeconds,
      ),
    });

    this.logger.log('Uploaded moment community media', {
      mediaId: media.id,
      ownerId: media.ownerId,
    });

    return mapMediaToResponse(media);
  }
}

@CommandHandler(UploadCommunityMoodboardMediaCommand)
export class UploadCommunityMoodboardMediaHandler
  implements
    ICommandHandler<
      UploadCommunityMoodboardMediaCommand,
      CommunityMediaUploadResponseDto[]
    >
{
  private readonly logger = new Logger(
    UploadCommunityMoodboardMediaHandler.name,
  );

  constructor(
    @Inject(ICommunityMediaRepository)
    private readonly communityMediaRepository: ICommunityMediaRepository,
    private readonly communityMediaStorage: CommunityMediaStorageService,
  ) {}

  async execute(
    command: UploadCommunityMoodboardMediaCommand,
  ): Promise<CommunityMediaUploadResponseDto[]> {
    if (!command.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }
    if (!command.files || command.files.length === 0) {
      throw RpcExceptionHelper.badRequest('No files provided');
    }
    if (command.files.length > MAX_MOODBOARD_FILES) {
      throw RpcExceptionHelper.badRequest(
        `Maximum ${MAX_MOODBOARD_FILES} files allowed per moodboard upload`,
      );
    }

    const durations = parseDurationMap(command.durationSecondsByFileName);
    const media = await Promise.all(
      command.files.map((file) => {
        const durationSeconds = resolveDuration(file, durations[file.originalname]);
        const mediaType = validateFile(file, durationSeconds ?? undefined);
        return uploadAndPersistMedia({
          repository: this.communityMediaRepository,
          storage: this.communityMediaStorage,
          userId: command.userId,
          file,
          uploadContext: CommunityMediaUploadContext.MOODBOARD,
          mediaType,
          durationSeconds,
        });
      }),
    );

    this.logger.log('Uploaded moodboard community media batch', {
      ownerId: command.userId,
      count: media.length,
    });

    return media.map(mapMediaToResponse);
  }
}

const uploadAndPersistMedia = async (input: {
  repository: ICommunityMediaRepository;
  storage: CommunityMediaStorageService;
  userId: string;
  file: Express.Multer.File;
  uploadContext: CommunityMediaUploadContext;
  mediaType: CommunityMediaType;
  durationSeconds?: number | null;
}): Promise<CommunityMedia> => {
  const uploadResult = await input.storage.uploadFile(input.file, {
    userId: input.userId,
    context: input.uploadContext,
    metadata: {
      ownerId: input.userId,
      uploadContext: input.uploadContext,
      mediaType: input.mediaType,
      originalFilename: input.file.originalname,
    },
  });

  return input.repository.create({
    ownerId: input.userId,
    uploadContext: input.uploadContext,
    mediaType: input.mediaType,
    mimeType: input.file.mimetype,
    storagePath: uploadResult.path,
    url: uploadResult.url,
    secureUrl: uploadResult.secureUrl,
    originalFilename: input.file.originalname,
    size: input.file.size,
    status: CommunityMediaStatus.PENDING,
    durationSeconds: input.durationSeconds ?? null,
    thumbnailUrl: null,
    consumedByType: null,
    consumedById: null,
    consumedAt: null,
  });
};

const validateFile = (
  file: Express.Multer.File,
  durationSeconds?: number | null,
): CommunityMediaType => {
  if (!file) {
    throw RpcExceptionHelper.badRequest('No file provided');
  }

  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw RpcExceptionHelper.badRequest(
        `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }
    return CommunityMediaType.IMAGE;
  }

  if (ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw RpcExceptionHelper.badRequest(
        `Video size exceeds maximum allowed size of ${MAX_VIDEO_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }
    if (
      typeof durationSeconds === 'number' &&
      durationSeconds > MAX_VIDEO_DURATION_SECONDS
    ) {
      throw RpcExceptionHelper.badRequest(
        `Video duration exceeds maximum allowed duration of ${MAX_VIDEO_DURATION_SECONDS} seconds`,
      );
    }
    return CommunityMediaType.VIDEO;
  }

  throw RpcExceptionHelper.badRequest(
    `Invalid file type. Allowed types: ${[
      ...ALLOWED_IMAGE_MIME_TYPES,
      ...ALLOWED_VIDEO_MIME_TYPES,
    ].join(', ')}`,
  );
};

const resolveDuration = (
  file: Express.Multer.File,
  durationSeconds?: number,
): number | null => {
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype)) {
    return null;
  }
  if (typeof durationSeconds !== 'number' || Number.isNaN(durationSeconds)) {
    return null;
  }
  return durationSeconds;
};

const parseDurationMap = (
  value?: Record<string, number> | string,
): Record<string, number> => {
  if (!value) {
    return {};
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return value;
};

const mapMediaToResponse = (
  media: CommunityMedia,
): CommunityMediaUploadResponseDto => ({
  mediaId: media.id,
  url: media.url,
  secureUrl: media.secureUrl,
  mediaType: media.mediaType,
  mimeType: media.mimeType,
  originalFilename: media.originalFilename,
  size: media.size,
  status: media.status,
  durationSeconds: media.durationSeconds,
  thumbnailUrl: media.thumbnailUrl,
  createdAt: media.createdAt,
});
