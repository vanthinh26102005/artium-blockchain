import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Message } from './message.entity';
import { ConversationParticipant } from './conversation-participant.entity';
import { AbstractEntity } from '@app/common';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  EVENT_CHAT = 'EVENT_CHAT',
  INQUIRY = 'INQUIRY',
}

@Entity('conversations')
@Index(['type', 'updatedAt'])
export class Conversation extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  isGroup: boolean;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityType: string;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'text', nullable: true })
  lastMessageContent: string;

  @Column({ type: 'varchar', nullable: true })
  lastMessageSenderId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(
    () => ConversationParticipant,
    (participant) => participant.conversation,
  )
  participants: ConversationParticipant[];
}
