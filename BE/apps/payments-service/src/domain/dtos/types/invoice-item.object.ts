import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType('InvoiceItem')
export class InvoiceItemObject {
  @Field(() => ID)
  itemId!: string;

  @Field(() => ID)
  invoiceId!: string;

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

  @Field(() => Float)
  lineTotal!: number;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field(() => Float, { nullable: true })
  taxAmount?: number;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
