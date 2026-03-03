import { Field, InputType, Float, ID } from '@nestjs/graphql';
import {
  TransactionType,
  PaymentProvider,
  PaymentMethodType,
} from '@app/common';

@InputType()
export class CreatePaymentInput {
  @Field(() => TransactionType)
  type!: TransactionType;

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

  @Field(() => Float, { nullable: true })
  platformFee?: number;

  @Field(() => ID, { nullable: true })
  paymentMethodId?: string;

  @Field(() => PaymentMethodType, { nullable: true })
  paymentMethodType?: PaymentMethodType;

  @Field({ nullable: true })
  description?: string;
}
