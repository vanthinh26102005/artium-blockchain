import { ArtworkImageInput } from '@app/common';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { GcsStorageService } from 'apps/artwork-service/src/domain';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const getImageExtension = (file?: Express.Multer.File, fallback = '.webp') =>
  path.extname(file?.originalname ?? '').toLowerCase() || fallback;

const createStoredImageFileName = (file?: Express.Multer.File) =>
  `${uuidv4()}${getImageExtension(file)}`;

interface UploadArtworkImageDto {
  sellerId: string;
  artworkId: string;
  altText?: string;
  isPrimary?: boolean;
  order?: number;
  file: Express.Multer.File;
}

interface UploadArtworkImagesDto {
  sellerId: string;
  artworkId: string;
  files: Express.Multer.File[];
}

interface UploadAvatarDto {
  userId: string;
  file: Express.Multer.File;
}

@Controller()
export class UploadMicroserviceController {
  private readonly logger = new Logger(UploadMicroserviceController.name);

  constructor(private readonly gcsStorage: GcsStorageService) {}

  @MessagePattern({ cmd: 'upload_artwork_image' })
  async uploadArtworkImage(
    @Payload() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput> {
    this.logger.log(`[Microservice] Uploading artwork image`, {
      sellerId: dto.sellerId,
      artworkId: dto.artworkId,
      fileName: dto.file?.originalname,
    });

    if (dto.sellerId === 'undefined' || dto.artworkId === 'undefined') {
      throw new RpcException('sellerId or artworkId is "undefined" string');
    }

    const uploadResult = await this.gcsStorage.uploadFile(dto.file, {
      folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
      fileName: createStoredImageFileName(dto.file),
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
      altText: dto.altText,
      order: dto.order,
      isPrimary: dto.isPrimary,
    };
  }

  @MessagePattern({ cmd: 'upload_artwork_images' })
  async uploadArtworkImages(
    @Payload() dto: UploadArtworkImagesDto,
  ): Promise<ArtworkImageInput[]> {
    this.logger.log(`[Microservice] Uploading multiple artwork images`, {
      sellerId: dto.sellerId,
      artworkId: dto.artworkId,
      filesCount: dto.files?.length,
    });

    if (dto.sellerId === 'undefined' || dto.artworkId === 'undefined') {
      throw new RpcException('sellerId or artworkId is "undefined" string');
    }

    const results = await Promise.all(
      dto.files.map(async (file, index) => {
        const uploadResult = await this.gcsStorage.uploadFile(file, {
          folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
          fileName: createStoredImageFileName(file),
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

    return results;
  }

  @MessagePattern({ cmd: 'upload_avatar' })
  async uploadAvatar(
    @Payload() dto: UploadAvatarDto,
  ): Promise<{ url: string; secureUrl: string }> {
    this.logger.log(`[Microservice] Uploading avatar`, {
      userId: dto.userId,
    });

    const uploadResult = await this.gcsStorage.uploadFile(dto.file, {
      folder: `avatars`,
      fileName: `${dto.userId}${getImageExtension(dto.file)}`,
      makePublic: true,
      metadata: {
        userId: dto.userId,
        type: 'avatar',
        uploadedBy: 'artwork-service',
      },
    });

    return {
      url: uploadResult.url,
      secureUrl: uploadResult.secureUrl,
    };
  }
}
