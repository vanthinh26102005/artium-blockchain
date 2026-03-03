import { ArtworkImageInput } from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
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
import { GcsStorageService } from 'apps/artwork-service/src/domain';
import { v4 as uuidv4 } from 'uuid';

class UploadArtworkImageDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

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

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly gcsStorage: GcsStorageService) {}

  @Post('artwork-image')
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
        sellerId: {
          type: 'string',
          description: 'Seller ID',
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
      required: ['file', 'sellerId', 'artworkId'],
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
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput> {
    const requestId = uuidv4();

    // Explicitly trim strings if they exist
    if (typeof dto.sellerId === 'string') dto.sellerId = dto.sellerId.trim();
    if (typeof dto.artworkId === 'string') dto.artworkId = dto.artworkId.trim();

    this.logger.log(`[${requestId}] Uploading artwork image`, {
      sellerId: dto.sellerId,
      sellerIdType: typeof dto.sellerId,
      artworkId: dto.artworkId,
      artworkIdType: typeof dto.artworkId,
      body: JSON.stringify(dto),
    });

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!dto.sellerId || !dto.artworkId) {
      throw new BadRequestException('sellerId and artworkId are required');
    }

    if (
      dto.sellerId === 'undefined' ||
      dto.sellerId === 'null' ||
      dto.artworkId === 'undefined' ||
      dto.artworkId === 'null'
    ) {
      throw new BadRequestException(
        'sellerId and artworkId cannot be the string "undefined" or "null"',
      );
    }

    try {
      const uploadResult = await this.gcsStorage.uploadFile(file, {
        folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
        fileName: `${uuidv4()}.webp`,
        makePublic: true,
        metadata: {
          sellerId: dto.sellerId,
          artworkId: dto.artworkId,
          uploadedBy: 'artwork-service',
        },
      });

      const result: ArtworkImageInput = {
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        secureUrl: uploadResult.secureUrl,
        bucket: uploadResult.bucket,
        altText: dto.altText,
        order: dto.order,
        isPrimary: dto.isPrimary,
      };

      this.logger.log(`[${requestId}] Artwork image uploaded successfully`, {
        path: uploadResult.path,
      });

      return result;
    } catch (error) {
      this.logger.error(`[${requestId}] Failed to upload artwork image`, error);
      throw error;
    }
  }

  @Post('artwork-images')
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
        sellerId: {
          type: 'string',
          description: 'Seller ID',
        },
        artworkId: {
          type: 'string',
          description: 'Artwork ID',
        },
      },
      required: ['files', 'sellerId', 'artworkId'],
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
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput[]> {
    const requestId = uuidv4();

    // Explicitly trim strings if they exist
    if (typeof dto.sellerId === 'string') dto.sellerId = dto.sellerId.trim();
    if (typeof dto.artworkId === 'string') dto.artworkId = dto.artworkId.trim();

    this.logger.log(
      `[${requestId}] Uploading ${files?.length || 0} artwork images`,
      {
        sellerId: dto.sellerId,
        sellerIdType: typeof dto.sellerId,
        artworkId: dto.artworkId,
        artworkIdType: typeof dto.artworkId,
        body: JSON.stringify(dto),
      },
    );

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (!dto.sellerId || !dto.artworkId) {
      throw new BadRequestException('sellerId and artworkId are required');
    }

    if (
      dto.sellerId === 'undefined' ||
      dto.sellerId === 'null' ||
      dto.artworkId === 'undefined' ||
      dto.artworkId === 'null'
    ) {
      throw new BadRequestException(
        'sellerId and artworkId cannot be the string "undefined" or "null"',
      );
    }

    try {
      const results = await Promise.all(
        files.map(async (file, index) => {
          const uploadResult = await this.gcsStorage.uploadFile(file, {
            folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
            fileName: `${uuidv4()}.webp`,
            makePublic: true,
            metadata: {
              sellerId: dto.sellerId,
              artworkId: dto.artworkId,
              uploadedBy: 'artwork-service',
            },
          });

          return {
            publicId: uploadResult.publicId,
            url: uploadResult.url,
            secureUrl: uploadResult.secureUrl,
            bucket: uploadResult.bucket,
            order: index,
            isPrimary: index === 0,
          };
        }),
      );

      this.logger.log(
        `[${requestId}] ${results.length} artwork images uploaded successfully`,
      );
      return results;
    } catch (error) {
      this.logger.error(
        `[${requestId}] Failed to upload artwork images`,
        error,
      );
      throw error;
    }
  }

  @Post('avatar')
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
    const requestId = uuidv4();
    this.logger.log(`[${requestId}] Uploading avatar for user: ${dto.userId}`);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!dto.userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      const uploadResult = await this.gcsStorage.uploadFile(file, {
        folder: `avatars`,
        fileName: `${dto.userId}.webp`,
        makePublic: true,
        metadata: {
          userId: dto.userId,
          type: 'avatar',
          uploadedBy: 'artwork-service',
        },
      });

      this.logger.log(`[${requestId}] Avatar uploaded successfully`, {
        path: uploadResult.path,
      });

      return {
        url: uploadResult.url,
        secureUrl: uploadResult.secureUrl,
      };
    } catch (error) {
      this.logger.error(`[${requestId}] Failed to upload avatar`, error);
      throw error;
    }
  }
}
