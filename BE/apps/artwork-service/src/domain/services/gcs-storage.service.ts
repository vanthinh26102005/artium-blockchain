import { Bucket, File, Storage } from '@google-cloud/storage';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  folder: string;
  fileName?: string;
  makePublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
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

interface SerializedBuffer {
  type: 'Buffer';
  data: number[];
}

const isSerializedBuffer = (value: unknown): value is SerializedBuffer =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  'data' in value &&
  (value as { type: unknown }).type === 'Buffer' &&
  Array.isArray((value as { data: unknown }).data);

const isErrorWithCode = (error: unknown, code: number): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === code;

@Injectable()
export class GcsStorageService {
  private readonly logger = new Logger(GcsStorageService.name);
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
      this.logger.log(
        `GCS Storage initialized: project=${this.projectId}, bucket=${this.bucketName}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize GCS Storage', error);
      throw new InternalServerErrorException(
        'Storage service initialization failed',
      );
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const requestId = uuidv4();
    this.logger.log(
      `[${requestId}] Uploading buffer to GCS: folder=${options.folder}, bufferIsBuffer=${Buffer.isBuffer(buffer)}, bufferType=${typeof buffer}`,
    );

    // Handle potential buffer serialization issues
    const incomingBuffer: unknown = buffer;
    if (!Buffer.isBuffer(incomingBuffer)) {
      if (isSerializedBuffer(incomingBuffer)) {
        this.logger.warn(`[${requestId}] converting JSON buffer to Buffer`);
        buffer = Buffer.from(incomingBuffer.data);
      } else {
        this.logger.warn(
          `[${requestId}] buffer argument is not a Buffer and does not look like a serialized Buffer. Received: ${typeof incomingBuffer}`,
        );
      }
    }

    try {
      const fileId = uuidv4();
      const extension = options.fileName
        ? path.extname(options.fileName)
        : '.webp';
      const fileName = options.fileName || `${fileId}${extension}`;
      const filePath = `${options.folder}/${fileName}`;

      const file: File = this.bucket.file(filePath);

      await file.save(buffer, {
        metadata: {
          contentType: this.getContentType(extension),
          metadata: {
            uploadedAt: new Date().toISOString(),
            id: fileId,
            ...options.metadata,
          },
        },
        resumable: false,
      });

      // Try to make the file public if requested
      // This will silently skip if bucket uses uniform bucket-level access
      if (options.makePublic) {
        try {
          await file.makePublic();
        } catch (aclError: unknown) {
          // Ignore error 400 - occurs when bucket has uniform bucket-level access enabled
          // In this case, public access is controlled at bucket level, not per-object
          if (!isErrorWithCode(aclError, 400)) {
            throw aclError;
          }
          this.logger.debug(
            `[${requestId}] Skipping makePublic - bucket uses uniform bucket-level access`,
          );
        }
      }

      const [metadata] = await file.getMetadata();

      const result: UploadResult = {
        id: fileId,
        publicId: filePath,
        url: this.getPublicUrl(filePath),
        secureUrl: this.getPublicUrl(filePath),
        path: filePath,
        format: extension.replace('.', ''),
        size: metadata.size ? parseInt(metadata.size as string) : buffer.length,
        bucket: this.bucketName,
        createdAt: new Date(),
      };

      this.logger.log(`[${requestId}] Upload successful: ${filePath}`);
      return result;
    } catch (error) {
      this.logger.error(`[${requestId}] Upload failed`, error);
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    this.validateFile(file);
    return this.uploadBuffer(file.buffer, {
      ...options,
      fileName: options.fileName || this.sanitizeFileName(file.originalname),
    });
  }

  async deleteFile(filePath: string): Promise<boolean> {
    const requestId = uuidv4();
    this.logger.log(`[${requestId}] Deleting file from GCS: ${filePath}`);

    try {
      const file: File = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        this.logger.warn(`[${requestId}] File not found: ${filePath}`);
        return false;
      }

      await file.delete();
      this.logger.log(`[${requestId}] File deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`[${requestId}] Delete failed: ${filePath}`, error);
      return false;
    }
  }

  async deleteFiles(filePaths: string[]): Promise<void> {
    const requestId = uuidv4();
    this.logger.log(
      `[${requestId}] Deleting ${filePaths.length} files from GCS`,
    );

    await Promise.allSettled(filePaths.map((path) => this.deleteFile(path)));
  }

  async generateSignedUrl(
    filePath: string,
    expiresInMinutes: number = 60,
  ): Promise<string> {
    const requestId = uuidv4();
    this.logger.log(`[${requestId}] Generating signed URL: ${filePath}`);

    try {
      const file: File = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        throw new BadRequestException(`File not found: ${filePath}`);
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });

      return url;
    } catch (error) {
      this.logger.error(`[${requestId}] Signed URL generation failed`, error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const file: File = this.bucket.file(filePath);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      this.logger.error(`Error checking file existence: ${filePath}`, error);
      return false;
    }
  }

  getPublicUrl(filePath: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
  }

  private validateFile(file: Express.Multer.File): void {
    const allowedTypes = this.configService
      .get<string>(
        'ALLOWED_IMAGE_TYPES',
        'image/jpeg,image/png,image/webp,image/gif,image/jpg',
      )
      .split(',');

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    const maxSize =
      this.configService.get<number>('MAX_FILE_SIZE_MB', 10) * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');
  }

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
