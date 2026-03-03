import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { CreateStripeCustomerCommand } from '../CreateStripeCustomer.command';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { StripeCustomerCreatedEvent } from '../../../../domain/events';
import { StripeService } from 'apps/payments-service/src/infrastructure';
import { IStripeCustomerRepository } from '../../../../domain/interfaces';

@CommandHandler(CreateStripeCustomerCommand)
export class CreateStripeCustomerHandler implements ICommandHandler<CreateStripeCustomerCommand> {
  private readonly logger = new Logger(CreateStripeCustomerHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: CreateStripeCustomerCommand,
  ): Promise<{ stripeCustomerId: string; email: string; name?: string }> {
    const { data } = command;

    this.logger.log(
      `Creating Stripe customer for user: ${data.userId}, email: ${data.email}`,
    );

    try {
      // Check if customer already exists
      const existingCustomer = await this.stripeCustomerRepo.findByUserId(
        data.userId,
      );
      if (existingCustomer) {
        throw RpcExceptionHelper.conflict(
          `Stripe customer already exists for user: ${data.userId}`,
        );
      }

      const metadata: Record<string, string> = {
        userId: data.userId,
        ...data.metadata,
      };

      const customer = await this.stripeService.createCustomer(
        data.email,
        data.name,
        metadata,
      );

      // Save customer locally
      await this.stripeCustomerRepo.create({
        userId: data.userId,
        stripeId: customer.id,
        email: customer.email!,
        name: customer.name || null,
        isActive: true,
      });

      this.logger.log(`Stripe customer created and saved: ${customer.id}`);

      const event = new StripeCustomerCreatedEvent(
        data.userId,
        customer.id,
        customer.email!,
        customer.name || undefined,
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'User',
        aggregateId: data.userId,
        eventType: StripeCustomerCreatedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.STRIPE_CUSTOMER_CREATED,
      });

      this.logger.log(
        `StripeCustomerCreatedEvent published for user: ${data.userId}`,
      );

      return {
        stripeCustomerId: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to create Stripe customer', error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
