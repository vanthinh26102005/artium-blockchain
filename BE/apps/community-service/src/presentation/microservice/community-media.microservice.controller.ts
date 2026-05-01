import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CommunityMediaUploadResponseDto,
  UploadCommunityMomentMediaDto,
  UploadCommunityMoodboardMediaDto,
} from '@app/common';
import {
  UploadCommunityMomentMediaCommand,
  UploadCommunityMoodboardMediaCommand,
} from '../../application';

@Controller()
export class CommunityMediaMicroserviceController {
  private readonly logger = new Logger(
    CommunityMediaMicroserviceController.name,
  );

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'upload_community_moment_media' })
  async uploadMomentMedia(
    @Payload()
    payload: UploadCommunityMomentMediaDto & {
      userId: string;
      file: Express.Multer.File;
    },
  ): Promise<CommunityMediaUploadResponseDto> {
    this.logger.log('[Microservice] Uploading moment community media', {
      userId: payload.userId,
      fileOriginalName: payload.file?.originalname,
    });

    return this.commandBus.execute(
      new UploadCommunityMomentMediaCommand(
        payload.userId,
        payload.file,
        payload.durationSeconds,
      ),
    );
  }

  @MessagePattern({ cmd: 'upload_community_moodboard_media' })
  async uploadMoodboardMedia(
    @Payload()
    payload: UploadCommunityMoodboardMediaDto & {
      userId: string;
      files: Express.Multer.File[];
    },
  ): Promise<CommunityMediaUploadResponseDto[]> {
    this.logger.log('[Microservice] Uploading moodboard community media', {
      userId: payload.userId,
      filesCount: payload.files?.length ?? 0,
    });

    return this.commandBus.execute(
      new UploadCommunityMoodboardMediaCommand(
        payload.userId,
        payload.files,
        payload.durationSecondsByFileName,
      ),
    );
  }
}
