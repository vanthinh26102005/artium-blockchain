import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PayoutObject } from '../../domain/dtos/types';
import { CreatePayoutInput } from '../../domain/dtos/inputs';
import {
  CreatePayoutCommand,
  GetPayoutQuery,
  GetPayoutsBySellerQuery,
} from '../../application';

@Resolver(() => PayoutObject)
export class PayoutsResolver {
  private readonly logger = new Logger(PayoutsResolver.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => PayoutObject, { nullable: true })
  async payout(@Args('payoutId', { type: () => ID }) payoutId: string) {
    this.logger.log(`Getting payout: ${payoutId}`);
    return this.queryBus.execute(new GetPayoutQuery(payoutId));
  }

  @Query(() => [PayoutObject])
  async payoutsBySeller(@Args('sellerId') sellerId: string) {
    this.logger.log(`Getting payouts for seller: ${sellerId}`);
    return this.queryBus.execute(new GetPayoutsBySellerQuery(sellerId));
  }

  @Mutation(() => PayoutObject)
  async createPayout(@Args('input') input: CreatePayoutInput) {
    this.logger.log(`Creating payout for seller: ${input.sellerId}`);
    return this.commandBus.execute(new CreatePayoutCommand(input));
  }
}
