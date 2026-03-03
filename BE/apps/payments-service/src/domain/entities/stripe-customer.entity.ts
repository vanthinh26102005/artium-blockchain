import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stripe_customers' })
@Index(['userId'], { unique: true })
export class StripeCustomer extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'stripe_customer_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({
    name: 'stripe_id',
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Stripe customer ID (cus_xxx)',
  })
  stripeId!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
