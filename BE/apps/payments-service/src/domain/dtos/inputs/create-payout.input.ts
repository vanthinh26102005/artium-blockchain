import { Field, InputType, Float } from '@nestjs/graphql';
import { PayoutProvider } from '@app/common';

@InputType()
export class CreatePayoutInput {
  @Field()
  sellerId!: string;

  @Field(() => PayoutProvider)
  provider!: PayoutProvider;

  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;

  @Field(() => Float, { nullable: true })
  transactionFee?: number;

  @Field(() => [String])
  transactionIds!: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
