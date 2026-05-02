import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CommunityMediaStatus,
  CommunityMediaUploadContext,
  MomentMediaType,
  RpcExceptionHelper,
} from '@app/common';
import { CreateMomentCommand } from '../CreateMoment.command';
import {
  ICommunityMediaRepository,
  IMomentRepository,
  Moment,
} from '../../../../domain';

@CommandHandler(CreateMomentCommand)
export class CreateMomentHandler implements ICommandHandler<
  CreateMomentCommand,
  Moment
> {
  private readonly logger = new Logger(CreateMomentHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
    @Inject(ICommunityMediaRepository)
    private readonly communityMediaRepository: ICommunityMediaRepository,
  ) {}

  async execute(command: CreateMomentCommand): Promise<Moment> {
    const reqId = `create-moment:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing create moment command`, {
      userId: command.input.userId,
    });

    try {
      if (!command.input.mediaId) {
        throw RpcExceptionHelper.badRequest('Uploaded media ID is required');
      }

      const media = await this.communityMediaRepository.findById(
        command.input.mediaId,
      );

      if (!media) {
        throw RpcExceptionHelper.badRequest('Uploaded media not found');
      }

      if (media.ownerId !== command.input.userId) {
        throw RpcExceptionHelper.badRequest(
          'Uploaded media does not belong to the current user',
        );
      }

      if (media.uploadContext !== CommunityMediaUploadContext.MOMENT) {
        throw RpcExceptionHelper.badRequest(
          'Uploaded media is not valid for moment creation',
        );
      }

      if (media.status !== CommunityMediaStatus.PENDING) {
        throw RpcExceptionHelper.badRequest('Uploaded media is not pending');
      }

      const { taggedArtworkIds, mediaId, ...momentData } = command.input;

      // Set expiration for ephemeral content (24 hours by default)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const momentInput = {
        ...momentData,
        mediaUrl: media.url,
        mediaType: media.mediaType as unknown as MomentMediaType,
        thumbnailUrl: media.thumbnailUrl,
        durationSeconds:
          command.input.durationSeconds ?? media.durationSeconds ?? null,
        expiresAt,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isArchived: false,
        isPinned: momentData.isPinned ?? false,
      };

      const moment = await this.momentRepository.create(momentInput);
      await this.communityMediaRepository.markConsumed(
        media.id,
        'moment',
        moment.id,
      );

      this.logger.log(`[${reqId}] Moment created successfully`, {
        momentId: moment.id,
        userId: moment.userId,
      });

      // TODO: Handle tagged artworks if provided
      // TODO: Publish event via outbox for activity feed

      return moment;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to create moment`, error.stack);

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to create moment');
    }
  }
}
