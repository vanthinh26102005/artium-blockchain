import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { Inject } from '@nestjs/common';

interface StripeCustomerCreatedPayload {
  userId: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  timestamp: string;
}

@Injectable()
export class StripeCustomerCreatedEventHandler {
  private readonly logger = new Logger(StripeCustomerCreatedEventHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.STRIPE_CUSTOMER_CREATED,
    queue: 'identity-service.stripe-customer-created',
    queueOptions: {
      durable: true,
    },
  })
  async handle(message: StripeCustomerCreatedPayload) {
    this.logger.log(
      `Received StripeCustomerCreatedEvent for user: ${message.userId}`,
    );

    try {
      const user = await this.userRepository.findById(message.userId);

      if (!user) {
        this.logger.error(`User not found: ${message.userId}`);
        return;
      }

      if (
        user.stripeCustomerId &&
        user.stripeCustomerId !== message.stripeCustomerId
      ) {
        this.logger.warn(
          `User ${message.userId} already has a different Stripe customer ID: ${user.stripeCustomerId}`,
        );
      }

      await this.userRepository.update(message.userId, {
        stripeCustomerId: message.stripeCustomerId,
      });

      this.logger.log(
        `User ${message.userId} updated with Stripe customer ID: ${message.stripeCustomerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle StripeCustomerCreatedEvent for user: ${message.userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
