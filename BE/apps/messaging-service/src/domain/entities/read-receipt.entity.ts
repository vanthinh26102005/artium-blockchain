import { AbstractEntity } from '@app/common';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('read_receipts')
@Index(['conversationId', 'userId'])
@Index(['messageId', 'userId'], { unique: true })
export class ReadReceipt extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  conversationId: string;

  @Column({ type: 'varchar' })
  messageId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'timestamp' })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;
}
