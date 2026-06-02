import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'wallet_ownerships' })
@Index(['userId'])
export class WalletOwnership extends AbstractEntity {
  @PrimaryColumn({
    name: 'wallet_address',
    type: 'varchar',
    length: 42,
  })
  walletAddress!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({
    name: 'linked_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  linkedAt?: Date | null;

  @Column({
    name: 'unlinked_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  unlinkedAt?: Date | null;

  @Column({ name: 'last_event_at', type: 'timestamp with time zone' })
  lastEventAt!: Date;
}
