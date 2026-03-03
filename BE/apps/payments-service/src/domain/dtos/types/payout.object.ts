import {
  Field,
  ObjectType,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { PayoutStatus, PayoutProvider } from '@app/common';

registerEnumType(PayoutStatus, { name: 'PayoutStatus' });
registerEnumType(PayoutProvider, { name: 'PayoutProvider' });

@ObjectType('Payout')
export class PayoutObject {
  @Field(() => ID)
  payoutId!: string;

  @Field()
  sellerId!: string;

  @Field(() => PayoutStatus)
  status!: PayoutStatus;

  @Field(() => PayoutProvider)
  provider!: PayoutProvider;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field(() => Float)
  transactionFee!: number;

  @Field(() => Float)
  netAmount!: number;

  @Field({ nullable: true })
  stripePayoutId?: string;

  @Field({ nullable: true })
  stripeAccountId?: string;

  @Field({ nullable: true })
  paypalPayoutBatchId?: string;

  @Field({ nullable: true })
  paypalPayoutItemId?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  failureCode?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  arrivalDate?: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
