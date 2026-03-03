import { AbstractEntity } from '@app/common';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('typing_indicators')
@Index(['conversationId', 'userId'], { unique: true })
@Index(['expiresAt'])
export class TypingIndicator extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  conversationId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'boolean', default: true })
  isTyping: boolean;

  @Column('timestamp')
  expiresAt: Date;
}
