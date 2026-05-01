import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CommunityMediaStatus,
  CommunityMediaUploadContext,
  ITransactionService,
  RpcExceptionHelper,
} from '@app/common';
import { CreateMoodboardCommand } from '../CreateMoodboard.command';
import {
  ICommunityMediaRepository,
  IMoodboardMediaRepository,
  IMoodboardRepository,
  CommunityMedia,
  Moodboard,
} from '../../../../domain';

const MAX_MOODBOARD_MEDIA_IDS = 10;

@CommandHandler(CreateMoodboardCommand)
export class CreateMoodboardHandler implements ICommandHandler<
  CreateMoodboardCommand,
  Moodboard
> {
  private readonly logger = new Logger(CreateMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(ICommunityMediaRepository)
    private readonly communityMediaRepository: ICommunityMediaRepository,
    @Inject(IMoodboardMediaRepository)
    private readonly moodboardMediaRepository: IMoodboardMediaRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: CreateMoodboardCommand): Promise<Moodboard> {
    const reqId = `create-moodboard:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing create moodboard command`, {
      userId: command.input.userId,
      title: command.input.title,
    });

    try {
      const mediaIds = command.input.mediaIds ?? [];

      if (mediaIds.length > MAX_MOODBOARD_MEDIA_IDS) {
        throw RpcExceptionHelper.badRequest(
          'Maximum 10 uploaded media IDs allowed per moodboard',
        );
      }

      if (new Set(mediaIds).size !== mediaIds.length) {
        throw RpcExceptionHelper.badRequest(
          'Duplicate uploaded media IDs are not allowed',
        );
      }

      if (command.input.coverMediaId && !mediaIds.includes(command.input.coverMediaId)) {
        throw RpcExceptionHelper.badRequest(
          'coverMediaId must be included in mediaIds',
        );
      }

      const mediaRows = mediaIds.length
        ? await this.communityMediaRepository.findByIds(mediaIds)
        : [];
      const mediaById = new Map(mediaRows.map((media) => [media.id, media]));

      const orderedMedia = mediaIds.map((mediaId) => {
        const media = mediaById.get(mediaId);
        if (!media) {
          throw RpcExceptionHelper.badRequest('Uploaded moodboard media not found');
        }
        this.assertUsableMoodboardMedia(media, command.input.userId);
        return media;
      });

      const coverMediaId = command.input.coverMediaId ?? orderedMedia[0]?.id;
      const coverMedia = coverMediaId ? mediaById.get(coverMediaId) : undefined;

      const moodboard = await this.transactionService.execute(async (manager) => {
        const { mediaIds: _mediaIds, coverMediaId: _coverMediaId, ...input } =
          command.input;
        const moodboardInput = {
          ...input,
          coverImageUrl: coverMedia?.url ?? null,
          artworkCount: 0,
          likeCount: 0,
          viewCount: 0,
          shareCount: 0,
          displayOrder: 0,
          isPrivate: command.input.isPrivate ?? false,
          isCollaborative: command.input.isCollaborative ?? false,
        };

        const createdMoodboard = await this.moodboardRepository.create(
          moodboardInput,
          manager,
        );

        if (orderedMedia.length) {
          await this.moodboardMediaRepository.createManyForMoodboard(
            createdMoodboard.id,
            orderedMedia.map((media, index) => ({
              communityMediaId: media.id,
              mediaType: media.mediaType,
              url: media.url,
              secureUrl: media.secureUrl,
              thumbnailUrl: media.thumbnailUrl,
              durationSeconds: media.durationSeconds,
              displayOrder: index,
              isCover: media.id === coverMediaId,
            })),
            manager,
          );

          await Promise.all(
            orderedMedia.map((media) =>
              this.communityMediaRepository.markConsumed(media.id, 'moodboard', createdMoodboard.id, manager),
            ),
          );
        }

        return createdMoodboard;
      });

      this.logger.log(`[${reqId}] Moodboard created successfully`, {
        moodboardId: moodboard.id,
        userId: moodboard.userId,
      });

      // TODO: Publish event via outbox for activity feed

      return moodboard;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to create moodboard`, error.stack);

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to create moodboard');
    }
  }

  private assertUsableMoodboardMedia(
    media: CommunityMedia,
    userId: string,
  ): void {
    if (media.ownerId !== userId) {
      throw RpcExceptionHelper.badRequest(
        'Uploaded moodboard media does not belong to the current user',
      );
    }

    if (media.uploadContext !== CommunityMediaUploadContext.MOODBOARD) {
      throw RpcExceptionHelper.badRequest(
        'Uploaded media is not valid for moodboard creation',
      );
    }

    if (media.status !== CommunityMediaStatus.PENDING) {
      throw RpcExceptionHelper.badRequest(
        'Uploaded moodboard media is not pending',
      );
    }
  }
}
