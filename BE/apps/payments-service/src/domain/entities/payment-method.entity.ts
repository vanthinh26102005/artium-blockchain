import { AbstractEntity } from '@app/common';
import { PaymentMethodType, PaymentProvider } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_methods' })
@Index(['userId', 'isDefault'])
export class PaymentMethod extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_method_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    comment: 'Payment provider (STRIPE, PAYPAL)',
  })
  provider!: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    comment: 'Type of payment method',
  })
  type!: PaymentMethodType;

  @Column({
    name: 'stripe_payment_method_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentMethodId?: string | null;

  @Column({
    name: 'paypal_payment_method_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalPaymentMethodId?: string | null;

  @Column({ name: 'last_four', type: 'varchar', length: 4, nullable: true })
  lastFour?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Card brand (Visa, Mastercard) or Bank name',
  })
  brand?: string | null;

  @Column({ name: 'expiry_month', type: 'smallint', nullable: true })
  expiryMonth?: number | null;

  @Column({ name: 'expiry_year', type: 'smallint', nullable: true })
  expiryYear?: number | null;

  @Column({
    name: 'billing_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  billingName?: string | null;

  @Column({
    name: 'billing_email',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  billingEmail?: string | null;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date | null;
}
