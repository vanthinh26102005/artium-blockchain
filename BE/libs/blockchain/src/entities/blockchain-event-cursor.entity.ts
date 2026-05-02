import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('blockchain_event_cursor')
export class BlockchainEventCursor {
  @PrimaryColumn({ name: 'listener_id', type: 'varchar', length: 100 })
  listenerId!: string;

  @Column({ name: 'last_processed_block', type: 'bigint', default: '0' })
  lastProcessedBlock!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
