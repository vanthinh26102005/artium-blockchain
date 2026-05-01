import { JwtAuthGuard } from '@app/auth';
import {
  CommunityMediaUploadResponseDto,
  UploadCommunityMomentMediaDto,
  UploadCommunityMoodboardMediaDto,
  UserPayload,
} from '@app/common';
import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

@ApiTags('Community - Uploads')
@Controller('community/uploads')
export class CommunityUploadsController {
  constructor(
    @Inject(MICROSERVICES.COMMUNITY_SERVICE)
    private readonly communityClient: ClientProxy,
  ) {}

  @Post('moment-media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile moment media',
    description:
      'Uploads one image or video for authenticated profile moment creation.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Moment image or video file',
        },
        durationSeconds: {
          type: 'number',
          description: 'Optional client-observed video duration in seconds',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Moment media uploaded successfully',
    type: CommunityMediaUploadResponseDto,
  })
  async uploadMomentMedia(
    @Request() req: { user: UserPayload },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadCommunityMomentMediaDto,
  ): Promise<CommunityMediaUploadResponseDto> {
    return sendRpc<CommunityMediaUploadResponseDto>(
      this.communityClient,
      { cmd: 'upload_community_moment_media' },
      {
        userId: req.user.id,
        user: req.user,
        file,
        durationSeconds: body.durationSeconds,
      },
    );
  }

  @Post('moodboard-media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile moodboard media',
    description:
      'Uploads a bounded batch of image or video files for authenticated moodboard creation.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Moodboard image or video files (max 10)',
        },
        durationSecondsByFileName: {
          type: 'object',
          additionalProperties: { type: 'number' },
          description: 'Optional duration metadata keyed by original filename',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Moodboard media uploaded successfully',
    type: [CommunityMediaUploadResponseDto],
  })
  async uploadMoodboardMedia(
    @Request() req: { user: UserPayload },
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadCommunityMoodboardMediaDto,
  ): Promise<CommunityMediaUploadResponseDto[]> {
    return sendRpc<CommunityMediaUploadResponseDto[]>(
      this.communityClient,
      { cmd: 'upload_community_moodboard_media' },
      {
        userId: req.user.id,
        user: req.user,
        files,
        durationSecondsByFileName: body.durationSecondsByFileName,
      },
    );
  }
}
