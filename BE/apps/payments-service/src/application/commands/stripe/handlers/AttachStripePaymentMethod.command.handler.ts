import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  PaymentProvider,
  PaymentMethodType,
} from '@app/common';
import { AttachStripePaymentMethodCommand } from '../AttachStripePaymentMethod.command';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import { IPaymentMethodRepository } from '../../../../domain/interfaces/payment-method.repository.interface';
import { IStripeCustomerRepository } from '../../../../domain/interfaces/stripe-customer.repository.interface';
import { PaymentMethod } from '../../../../domain/entities/payment-method.entity';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { PaymentMethodAttachedEvent } from '../../../../domain/events';

@CommandHandler(AttachStripePaymentMethodCommand)
export class AttachStripePaymentMethodHandler implements ICommandHandler<AttachStripePaymentMethodCommand> {
  private readonly logger = new Logger(AttachStripePaymentMethodHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentMethodRepository)
    private readonly paymentMethodRepo: IPaymentMethodRepository,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: AttachStripePaymentMethodCommand,
  ): Promise<PaymentMethod> {
    const { data } = command;

    // Verify user has a Stripe customer
    const stripeCustomer = await this.stripeCustomerRepo.findByUserId(
      data.userId,
    );
    if (!stripeCustomer) {
      throw RpcExceptionHelper.badRequest(
        'User must register as a Stripe customer before attaching payment methods. Please call create_stripe_customer first.',
      );
    }

    this.logger.log(
      `Attaching payment method ${data.paymentMethodId} to customer ${stripeCustomer.stripeId}`,
    );

    try {
      const paymentMethod = await this.stripeService.attachPaymentMethod(
        data.paymentMethodId,
        stripeCustomer.stripeId, // Use the verified Stripe customer ID
      );

      const card = paymentMethod.card;
      const type =
        paymentMethod.type === 'card'
          ? PaymentMethodType.CARD
          : PaymentMethodType.BANK_ACCOUNT;

      const savedPaymentMethod = await this.paymentMethodRepo.create({
        userId: data.userId,
        provider: PaymentProvider.STRIPE,
        type,
        stripePaymentMethodId: paymentMethod.id,
        lastFour: card?.last4 || null,
        brand: card?.brand || null,
        expiryMonth: card?.exp_month || null,
        expiryYear: card?.exp_year || null,
        isDefault: false,
        isActive: true,
      });

      const event = new PaymentMethodAttachedEvent(
        data.userId,
        savedPaymentMethod.id,
        paymentMethod.id,
        type,
        card?.last4,
        card?.brand,
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentMethod',
        aggregateId: savedPaymentMethod.id,
        eventType: PaymentMethodAttachedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_METHOD_ATTACHED,
      });

      this.logger.log(
        `Payment method attached and saved: ${savedPaymentMethod.id}`,
      );
      this.logger.log(
        `PaymentMethodAttachedEvent published for user: ${data.userId}`,
      );
      return savedPaymentMethod;
    } catch (error) {
      this.logger.error('Failed to attach payment method', error.stack);
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
