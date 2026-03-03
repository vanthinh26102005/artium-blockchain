import {
  Field,
  ObjectType,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { InvoiceStatus } from '@app/common';
import { InvoiceItemObject } from './invoice-item.object';

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
});

@ObjectType('Invoice')
export class InvoiceObject {
  @Field(() => ID)
  invoiceId!: string;

  @Field()
  sellerId!: string;

  @Field({ nullable: true })
  collectorId?: string;

  @Field()
  customerEmail!: string;

  @Field()
  invoiceNumber!: string;

  @Field(() => InvoiceStatus)
  status!: InvoiceStatus;

  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  taxAmount!: number;

  @Field(() => Float)
  discountAmount!: number;

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  currency!: string;

  @Field(() => ID, { nullable: true })
  paymentTransactionId?: string;

  @Field()
  issueDate!: Date;

  @Field()
  dueDate!: Date;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  sentAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  termsAndConditions?: string;

  @Field(() => [InvoiceItemObject], { nullable: true })
  items?: InvoiceItemObject[];

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
