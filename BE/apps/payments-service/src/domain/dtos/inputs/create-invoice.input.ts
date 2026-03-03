import { Field, InputType, Float, Int, ID } from '@nestjs/graphql';
import { InvoiceStatus } from '@app/common';

@InputType()
export class CreateInvoiceItemInput {
  @Field(() => ID, { nullable: true })
  artworkId?: string;

  @Field({ nullable: true })
  artworkTitle?: string;

  @Field({ nullable: true })
  artworkImageUrl?: string;

  @Field()
  description!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  sellerId!: string;

  @Field({ nullable: true })
  collectorId?: string;

  @Field()
  customerEmail!: string;

  @Field()
  invoiceNumber!: string;

  @Field(() => InvoiceStatus, { nullable: true })
  status?: InvoiceStatus;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field()
  currency!: string;

  @Field()
  issueDate!: Date;

  @Field()
  dueDate!: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  termsAndConditions?: string;

  @Field(() => [CreateInvoiceItemInput])
  items!: CreateInvoiceItemInput[];
}
