import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

export enum CommunityMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum CommunityMediaUploadContext {
  MOMENT = 'moment',
  MOODBOARD = 'moodboard',
}

export enum CommunityMediaStatus {
  PENDING = 'pending',
  CONSUMED = 'consumed',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export class CommunityMediaUploadResponseDto {
  @ApiProperty({ description: 'Backend-issued uploaded media ID' })
  mediaId!: string;

  @ApiProperty({ description: 'Public URL for the uploaded media' })
  url!: string;

  @ApiProperty({ description: 'Secure URL for the uploaded media' })
  secureUrl!: string;

  @ApiProperty({ enum: CommunityMediaType })
  mediaType!: CommunityMediaType;

  @ApiProperty({ description: 'Original MIME type supplied by the upload' })
  mimeType!: string;

  @ApiProperty({ description: 'Original client filename' })
  originalFilename!: string;

  @ApiProperty({ description: 'Stored file size in bytes' })
  size!: number;

  @ApiProperty({ enum: CommunityMediaStatus })
  status!: CommunityMediaStatus;

  @ApiPropertyOptional({
    description: 'Video duration in seconds when available',
  })
  durationSeconds?: number | null;

  @ApiPropertyOptional({
    description: 'Thumbnail or poster URL when available',
  })
  thumbnailUrl?: string | null;

  @ApiProperty({ description: 'Upload creation timestamp' })
  createdAt!: Date;
}

export class UploadCommunityMomentMediaDto {
  @ApiPropertyOptional({
    description:
      'Client-observed video duration in seconds. Backend remains authoritative when it can verify duration.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationSeconds?: number;
}

export class UploadCommunityMoodboardMediaDto {
  @ApiPropertyOptional({
    description:
      'Optional per-file duration metadata keyed by original filename',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @IsOptional()
  @IsObject()
  durationSecondsByFileName?: Record<string, number>;
}
