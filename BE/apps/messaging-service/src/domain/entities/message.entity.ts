import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { AbstractEntity } from '@app/common';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  ARTWORK_SHARE = 'ARTWORK_SHARE',
  MOODBOARD_SHARE = 'MOODBOARD_SHARE',
  EVENT_INVITE = 'EVENT_INVITE',
  SYSTEM = 'SYSTEM',
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
export class Message extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'varchar', nullable: true })
  mediaUrl: string | null;

  @Column({ type: 'varchar' })
  senderId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'varchar' })
  conversationId: string;

  @Column({ type: 'varchar', nullable: true })
  replyToMessageId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    artworkId?: string;
    artworkTitle?: string;
    artworkImage?: string;
    moodboardId?: string;
    eventId?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  mentionedUserIds: string[];

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  reactions: Array<{
    userId: string;
    emoji: string;
    createdAt: Date;
  }>;
}
