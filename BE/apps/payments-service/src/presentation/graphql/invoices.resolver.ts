import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InvoiceObject } from '../../domain/dtos/types';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../../domain/dtos/inputs';
import {
  CreateInvoiceCommand,
  UpdateInvoiceCommand,
  CancelInvoiceCommand,
  GetInvoiceQuery,
  GetInvoicesBySellerQuery,
  GetInvoicesByCollectorQuery,
} from '../../application';

@Resolver(() => InvoiceObject)
export class InvoicesResolver {
  private readonly logger = new Logger(InvoicesResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => InvoiceObject, { nullable: true })
  async invoice(@Args('invoiceId', { type: () => ID }) invoiceId: string) {
    this.logger.log(`Getting invoice: ${invoiceId}`);
    return this.queryBus.execute(new GetInvoiceQuery(invoiceId));
  }

  @Query(() => [InvoiceObject])
  async invoicesBySeller(@Args('sellerId') sellerId: string) {
    this.logger.log(`Getting invoices for seller: ${sellerId}`);
    return this.queryBus.execute(new GetInvoicesBySellerQuery(sellerId));
  }

  @Query(() => [InvoiceObject])
  async invoicesByCollector(@Args('collectorId') collectorId: string) {
    this.logger.log(`Getting invoices for collector: ${collectorId}`);
    return this.queryBus.execute(new GetInvoicesByCollectorQuery(collectorId));
  }

  @Mutation(() => InvoiceObject)
  async createInvoice(@Args('input') input: CreateInvoiceInput) {
    this.logger.log(`Creating invoice: ${input.invoiceNumber}`);

    const data = {
      ...input,
      orderId: input.orderId,
    };

    return this.commandBus.execute(new CreateInvoiceCommand(data));
  }

  @Mutation(() => InvoiceObject)
  async updateInvoice(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('input') input: UpdateInvoiceInput,
  ) {
    this.logger.log(`Updating invoice: ${invoiceId}`);
    return this.commandBus.execute(new UpdateInvoiceCommand(invoiceId, input));
  }

  @Mutation(() => InvoiceObject)
  async cancelInvoice(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
  ) {
    this.logger.log(`Cancelling invoice: ${invoiceId}`);
    return this.commandBus.execute(new CancelInvoiceCommand(invoiceId));
  }
}
