import {
  Field,
  ObjectType,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import {
  EscrowState,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  PaymentMethodType,
} from '@app/common';

registerEnumType(TransactionType, { name: 'TransactionType' });
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });
registerEnumType(PaymentProvider, { name: 'PaymentProvider' });
registerEnumType(PaymentMethodType, { name: 'PaymentMethodType' });
registerEnumType(EscrowState, { name: 'EscrowState' });

@ObjectType('PaymentTransaction')
export class PaymentTransactionObject {
  @Field(() => ID)
  transactionId!: string;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => TransactionStatus)
  status!: TransactionStatus;

  @Field(() => PaymentProvider)
  provider!: PaymentProvider;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  sellerId?: string;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  invoiceId?: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field(() => Float)
  platformFee!: number;

  @Field(() => Float)
  netAmount!: number;

  @Field({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  stripeChargeId?: string;

  @Field({ nullable: true })
  paypalOrderId?: string;

  @Field({ nullable: true })
  paypalCaptureId?: string;

  @Field(() => ID, { nullable: true })
  paymentMethodId?: string;

  @Field(() => PaymentMethodType, { nullable: true })
  paymentMethodType?: PaymentMethodType;

  @Field({ nullable: true })
  paymentMethodLastFour?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  failureCode?: string;

  @Field(() => Float, { nullable: true })
  refundAmount?: number;

  @Field({ nullable: true })
  refundReason?: string;

  @Field({ nullable: true })
  refundedAt?: Date;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // ── Blockchain / Escrow fields ──

  @Field(() => Int, {
    nullable: true,
    description: 'On-chain escrow state (matches Solidity enum)',
  })
  escrowState?: EscrowState | null;

  @Field({
    nullable: true,
    description: 'Blockchain transaction hash',
  })
  txHash?: string | null;

  @Field({
    nullable: true,
    description: 'Ethereum wallet address',
  })
  walletAddress?: string | null;
}
