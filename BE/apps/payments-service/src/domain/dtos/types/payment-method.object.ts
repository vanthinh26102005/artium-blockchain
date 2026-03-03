import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { PaymentProvider, PaymentMethodType } from '@app/common';

@ObjectType('PaymentMethod')
export class PaymentMethodObject {
  @Field(() => ID)
  paymentMethodId!: string;

  @Field()
  userId!: string;

  @Field(() => PaymentProvider)
  provider!: PaymentProvider;

  @Field(() => PaymentMethodType)
  type!: PaymentMethodType;

  @Field({ nullable: true })
  lastFour?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => Int, { nullable: true })
  expiryMonth?: number;

  @Field(() => Int, { nullable: true })
  expiryYear?: number;

  @Field()
  billingName!: string;

  @Field({ nullable: true })
  billingEmail?: string;

  @Field()
  isDefault!: boolean;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
