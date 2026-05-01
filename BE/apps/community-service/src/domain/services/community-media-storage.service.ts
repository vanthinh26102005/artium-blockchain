import { Bucket, File, Storage } from '@google-cloud/storage';
import {
  CommunityMediaUploadContext,
  RpcExceptionHelper,
} from '@app/common';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface CommunityMediaUploadOptions {
  userId: string;
  context: CommunityMediaUploadContext;
  metadata?: Record<string, string>;
}

export interface CommunityMediaUploadResult {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  path: string;
  format: string;
  size: number;
  bucket: string;
  createdAt: Date;
}

@Injectable()
export class CommunityMediaStorageService {
  private readonly logger = new Logger(CommunityMediaStorageService.name);
  private readonly storage: Storage;
  private readonly bucket: Bucket;
  private readonly bucketName: string;
  private readonly projectId: string;

  constructor(private readonly configService: ConfigService) {
    this.projectId = this.configService.get<string>('GCS_PROJECT_ID')!;
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME')!;
    const keyFilename = this.configService.get<string>('GCS_KEY_FILE');

    if (!this.projectId || !this.bucketName) {
      throw new Error('GCS_PROJECT_ID and GCS_BUCKET_NAME must be configured');
    }

    try {
      this.storage = new Storage({
        projectId: this.projectId,
        keyFilename: keyFilename || undefined,
      });
      this.bucket = this.storage.bucket(this.bucketName);
    } catch (error) {
      this.logger.error('Failed to initialize community media storage', error);
      throw new InternalServerErrorException(
        'Community media storage initialization failed',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: CommunityMediaUploadOptions,
  ): Promise<CommunityMediaUploadResult> {
    if (!file) {
      throw RpcExceptionHelper.badRequest('No file provided');
    }

    return this.uploadBuffer(file.buffer, {
      ...options,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
    });
  }

  private async uploadBuffer(
    buffer: Buffer,
    options: CommunityMediaUploadOptions & {
      originalFileName: string;
      mimeType: string;
    },
  ): Promise<CommunityMediaUploadResult> {
    const requestId = uuidv4();
    let uploadBuffer = buffer;

    if (!Buffer.isBuffer(uploadBuffer)) {
      if (
        typeof uploadBuffer === 'object' &&
        uploadBuffer !== null &&
        (uploadBuffer as any).type === 'Buffer' &&
        Array.isArray((uploadBuffer as any).data)
      ) {
        uploadBuffer = Buffer.from((uploadBuffer as any).data);
      }
    }

    try {
      const fileId = uuidv4();
      const extension =
        path.extname(options.originalFileName) ||
        this.getExtensionForMimeType(options.mimeType);
      const fileName = `${fileId}${extension}`;
      const filePath = `${this.getFolder(options.userId, options.context)}/${fileName}`;
      const file: File = this.bucket.file(filePath);

      await file.save(uploadBuffer, {
        metadata: {
          contentType: this.getContentType(extension),
          metadata: {
            uploadedAt: new Date().toISOString(),
            id: fileId,
            ownerId: options.userId,
            uploadContext: options.context,
            uploadedBy: 'community-service',
            ...options.metadata,
          },
        },
        resumable: false,
      });

      try {
        await file.makePublic();
      } catch (aclError: any) {
        if (aclError?.code !== 400) {
          throw aclError;
        }
        this.logger.debug(
          `[${requestId}] Skipping makePublic - bucket uses uniform bucket-level access`,
        );
      }

      const [metadata] = await file.getMetadata();

      return {
        id: fileId,
        publicId: filePath,
        url: this.getPublicUrl(filePath),
        secureUrl: this.getPublicUrl(filePath),
        path: filePath,
        format: extension.replace('.', ''),
        size: metadata.size
          ? parseInt(metadata.size as string, 10)
          : uploadBuffer.length,
        bucket: this.bucketName,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`[${requestId}] Community media upload failed`, error);
      throw RpcExceptionHelper.internalError('Failed to upload community media');
    }
  }

  getPublicUrl(filePath: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
  }

  private getFolder(
    userId: string,
    context: CommunityMediaUploadContext,
  ): string {
    if (context === CommunityMediaUploadContext.MOMENT) {
      return `community/${userId}/moments`;
    }

    return `community/${userId}/moodboards`;
  }

  private getExtensionForMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
    };

    return extensions[mimeType] || '.bin';
  }

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
