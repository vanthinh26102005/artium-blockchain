import { JwtAuthGuard } from '@app/auth';
import { ArtworkImageInput, UserPayload } from '@app/common';
import {
  Body,
  Controller,
  Inject,
  Logger,
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
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MICROSERVICES } from 'apps/api-gateway/src/config';
import { sendRpc } from '../../utils';

class UploadArtworkImageDto {
  @IsString()
  @IsNotEmpty()
  artworkId: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}

class UploadAvatarDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

@ApiTags('Upload')
@Controller('artwork/uploads')
export class UploadController {
  constructor(
    @Inject(MICROSERVICES.ARTWORK_SERVICE)
    private readonly artworkClient: ClientProxy,
  ) {}

  @Post('artwork-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload artwork image',
    description:
      'Uploads an artwork image to Google Cloud Storage with optimization',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        artworkId: {
          type: 'string',
          description: 'Artwork ID',
        },
        altText: {
          type: 'string',
          description: 'Alternative text for the image',
        },
        isPrimary: {
          type: 'boolean',
          description: 'Whether this is the primary image',
        },
        order: {
          type: 'number',
          description: 'Display order',
        },
      },
      required: ['file', 'artworkId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        publicId: { type: 'string' },
        url: { type: 'string' },
        secureUrl: { type: 'string' },
        format: { type: 'string' },
        width: { type: 'number' },
        height: { type: 'number' },
        size: { type: 'number' },
        bucket: { type: 'string' },
      },
    },
  })
  async uploadArtworkImage(
    @Request() req: { user: UserPayload },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput> {
    const logger = new Logger('ApiGatewayUpload');
    logger.log('Received uploadArtworkImage request', {
      sellerId: req.user.id,
      artworkId: dto.artworkId,
      fileOriginalName: file?.originalname,
      fileSize: file?.size,
      dto: JSON.stringify(dto),
    });

    if (req.user.id === 'undefined' || dto.artworkId === 'undefined') {
      throw new Error('sellerId or artworkId is "undefined" string');
    }

    return sendRpc<ArtworkImageInput>(
      this.artworkClient,
      { cmd: 'upload_artwork_image' },
      { ...dto, sellerId: req.user.id, user: req.user, file },
    );
  }

  @Post('artwork-images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple artwork images',
    description:
      'Uploads multiple artwork images to Google Cloud Storage with optimization',
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
          description: 'Image files to upload (max 10)',
        },
        artworkId: {
          type: 'string',
          description: 'Artwork ID',
        },
      },
      required: ['files', 'artworkId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          publicId: { type: 'string' },
          url: { type: 'string' },
          secureUrl: { type: 'string' },
          format: { type: 'string' },
          width: { type: 'number' },
          height: { type: 'number' },
          size: { type: 'number' },
          bucket: { type: 'string' },
        },
      },
    },
  })
  async uploadArtworkImages(
    @Request() req: { user: UserPayload },
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput[]> {
    const logger = new Logger('ApiGatewayUpload');
    logger.log('Received uploadArtworkImages request', {
      sellerId: req.user.id,
      artworkId: dto.artworkId,
      filesCount: files?.length,
      dto: JSON.stringify(dto),
    });

    if (req.user.id === 'undefined' || dto.artworkId === 'undefined') {
      throw new Error('sellerId or artworkId is "undefined" string');
    }

    return sendRpc<ArtworkImageInput[]>(
      this.artworkClient,
      { cmd: 'upload_artwork_images' },
      { ...dto, sellerId: req.user.id, user: req.user, files },
    );
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Uploads a user avatar image to Google Cloud Storage with optimization',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
        userId: {
          type: 'string',
          description: 'User ID',
        },
      },
      required: ['file', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        secureUrl: { type: 'string' },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAvatarDto,
  ): Promise<{ url: string; secureUrl: string }> {
    return sendRpc<{ url: string; secureUrl: string }>(
      this.artworkClient,
      { cmd: 'upload_avatar' },
      { ...dto, file },
    );
  }
}
