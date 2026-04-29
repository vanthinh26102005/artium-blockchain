import {
  ArtworkImageInput,
  ArtworkStatus,
  RpcExceptionHelper,
} from '@app/common';
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { GcsStorageService } from '../../domain/services/gcs-storage.service';
import {
  IArtworkRepository,
  type IArtworkRepository as ArtworkRepositoryContract,
} from '../../domain/interfaces/artwork.repository.interface';

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

  constructor(
    private readonly gcsStorage: GcsStorageService,
    @Inject(IArtworkRepository)
    private readonly artworkRepo: ArtworkRepositoryContract,
  ) {}

  private async validateDraftUpload(
    sellerId: string,
    artworkId: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    if (!file) {
      throw RpcExceptionHelper.badRequest('Artwork image file is required');
    }

    if (sellerId === 'undefined' || artworkId === 'undefined') {
      throw new RpcException('sellerId or artworkId is "undefined" string');
    }

    const artwork = await this.artworkRepo.findById(artworkId);
    if (!artwork) {
      throw RpcExceptionHelper.notFound(`Artwork draft ${artworkId} not found`);
    }

    if (artwork.sellerId !== sellerId) {
      throw RpcExceptionHelper.forbidden(
        `Artwork draft ${artworkId} does not belong to this seller`,
      );
    }

    if (artwork.status !== ArtworkStatus.DRAFT) {
      throw RpcExceptionHelper.badRequest(
        `Artwork ${artworkId} is not a draft`,
      );
    }
  }

  @MessagePattern({ cmd: 'upload_artwork_image' })
  async uploadArtworkImage(
    @Payload() dto: UploadArtworkImageDto,
  ): Promise<ArtworkImageInput> {
    this.logger.log(`[Microservice] Uploading artwork image`, {
      sellerId: dto.sellerId,
      artworkId: dto.artworkId,
      fileName: dto.file?.originalname,
    });

    await this.validateDraftUpload(dto.sellerId, dto.artworkId, dto.file);

    const uploadResult = await this.gcsStorage.uploadFile(dto.file, {
      folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
      fileName: `${randomUUID()}.webp`,
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

    if (!dto.files?.length) {
      throw RpcExceptionHelper.badRequest(
        'At least one artwork image is required',
      );
    }

    if (dto.sellerId === 'undefined' || dto.artworkId === 'undefined') {
      throw new RpcException('sellerId or artworkId is "undefined" string');
    }

    const artwork = await this.artworkRepo.findById(dto.artworkId);
    if (!artwork) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${dto.artworkId} not found`,
      );
    }

    if (artwork.sellerId !== dto.sellerId) {
      throw RpcExceptionHelper.forbidden(
        `Artwork draft ${dto.artworkId} does not belong to this seller`,
      );
    }

    if (artwork.status !== ArtworkStatus.DRAFT) {
      throw RpcExceptionHelper.badRequest(
        `Artwork ${dto.artworkId} is not a draft`,
      );
    }

    const results = await Promise.all(
      dto.files.map(async (file, index) => {
        const uploadResult = await this.gcsStorage.uploadFile(file, {
          folder: `artworks/${dto.sellerId}/${dto.artworkId}`,
          fileName: `${randomUUID()}.webp`,
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
      fileName: `${dto.userId}.webp`,
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
