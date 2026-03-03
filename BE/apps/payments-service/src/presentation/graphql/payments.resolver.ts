import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  PaymentTransactionObject,
  PaymentMethodObject,
} from '../../domain/dtos/types';
import { CreatePaymentInput } from '../../domain/dtos/inputs';
import {
  CreatePaymentCommand,
  GetPaymentTransactionQuery,
  GetPaymentMethodsQuery,
  GetTransactionsByUserQuery,
} from '../../application';

@Resolver(() => PaymentTransactionObject)
export class PaymentsResolver {
  private readonly logger = new Logger(PaymentsResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => PaymentTransactionObject, { nullable: true })
  async paymentTransaction(
    @Args('transactionId', { type: () => ID }) transactionId: string,
  ) {
    this.logger.log(`Getting payment transaction: ${transactionId}`);
    return this.queryBus.execute(new GetPaymentTransactionQuery(transactionId));
  }

  @Query(() => [PaymentTransactionObject])
  async paymentTransactionsByUser(@Args('userId') userId: string) {
    this.logger.log(`Getting transactions for user: ${userId}`);
    return this.queryBus.execute(new GetTransactionsByUserQuery(userId));
  }

  @Query(() => [PaymentMethodObject])
  async paymentMethods(@Args('userId') userId: string) {
    this.logger.log(`Getting payment methods for user: ${userId}`);
    return this.queryBus.execute(new GetPaymentMethodsQuery(userId));
  }

  @Mutation(() => PaymentTransactionObject)
  async createPayment(@Args('input') input: CreatePaymentInput) {
    this.logger.log(`Creating payment for user: ${input.userId}`);

    const data = {
      ...input,
      orderId: input.orderId,
      invoiceId: input.invoiceId,
    };

    return this.commandBus.execute(new CreatePaymentCommand(data));
  }
}
