import { AbstractEntity } from '@app/common';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AttachmentType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  ARTWORK = 'ARTWORK',
  MOODBOARD = 'MOODBOARD',
}

@Entity('message_attachments')
@Index(['messageId'])
export class MessageAttachment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  messageId: string;

  @Column('uuid')
  conversationId: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column('text')
  url: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'text', nullable: true })
  fileName: string;

  @Column({ type: 'integer', nullable: true })
  fileSize: number;

  @Column({ type: 'text', nullable: true })
  mimeType: string;

  @Column({ type: 'integer', nullable: true })
  width: number;

  @Column({ type: 'integer', nullable: true })
  height: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'uuid', nullable: true })
  artworkId: string;

  @Column({ type: 'uuid', nullable: true })
  moodboardId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    artworkTitle?: string;
    artworkPrice?: string;
    artworkImage?: string;
    moodboardTitle?: string;
    moodboardCover?: string;
    [key: string]: any;
  };
}
