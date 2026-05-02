import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('blockchain_processed_event')
@Index(['txHash', 'logIndex'], { unique: true })
export class BlockchainProcessedEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tx_hash', type: 'varchar', length: 66 })
  txHash!: string;

  @Column({ name: 'log_index', type: 'integer' })
  logIndex!: number;

  @Column({ name: 'block_number', type: 'bigint' })
  blockNumber!: string;

  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  eventName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
