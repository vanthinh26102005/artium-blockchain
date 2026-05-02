import {
  AbstractEntity,
  CommunityMediaStatus,
  CommunityMediaType,
  CommunityMediaUploadContext,
} from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'community_media' })
@Index(['ownerId', 'status'])
@Index(['uploadContext', 'status'])
@Index(['createdAt'])
export class CommunityMedia extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'media_id' })
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({
    name: 'upload_context',
    type: 'enum',
    enum: CommunityMediaUploadContext,
  })
  uploadContext!: CommunityMediaUploadContext;

  @Column({ name: 'media_type', type: 'enum', enum: CommunityMediaType })
  mediaType!: CommunityMediaType;

  @Column({ name: 'mime_type', type: 'varchar', length: 128 })
  mimeType!: string;

  @Column({ name: 'storage_path', type: 'varchar', length: 1024 })
  storagePath!: string;

  @Column({ type: 'varchar', length: 1024 })
  url!: string;

  @Column({ name: 'secure_url', type: 'varchar', length: 1024 })
  secureUrl!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  originalFilename!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({
    type: 'enum',
    enum: CommunityMediaStatus,
    default: CommunityMediaStatus.PENDING,
  })
  status!: CommunityMediaStatus;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({
    name: 'consumed_by_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  consumedByType: string | null;

  @Column({ name: 'consumed_by_id', type: 'uuid', nullable: true })
  consumedById: string | null;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null;
}
