import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum SegmentType {
  DYNAMIC = 'DYNAMIC',
  STATIC = 'STATIC',
}

@Entity({ name: 'customer_segments' })
@Index(['sellerId'])
export class CustomerSegment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'segment_id' })
  id!: string;

  @Column({ name: 'seller_id', type: 'string' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: SegmentType,
    default: SegmentType.STATIC,
  })
  type!: SegmentType;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Rules for dynamic segment filtering',
  })
  rules?: {
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    logic?: 'AND' | 'OR';
  } | null;

  @Column({
    name: 'contact_ids',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of contact IDs for static segments',
  })
  contactIds?: string[] | null;

  @Column({ name: 'member_count', type: 'int', default: 0 })
  memberCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    name: 'last_calculated_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Last time dynamic rules were evaluated',
  })
  lastCalculatedAt?: Date | null;

  @Column({
    name: 'average_engagement_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  averageEngagementScore?: string | null;

  @Column({
    name: 'total_segment_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    comment: 'Total value of all purchases by segment',
  })
  totalSegmentValue?: string | null;
}
