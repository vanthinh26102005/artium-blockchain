import { Field, InputType } from '@nestjs/graphql';
import { InvoiceStatus } from '@app/common';
import { CreateInvoiceItemInput } from './create-invoice.input';

@InputType()
export class UpdateInvoiceInput {
  @Field({ nullable: true })
  collectorId?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  status?: InvoiceStatus;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  termsAndConditions?: string;

  @Field(() => [CreateInvoiceItemInput], { nullable: true })
  items?: CreateInvoiceItemInput[];
}
