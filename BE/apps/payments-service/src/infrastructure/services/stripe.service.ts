import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
  ) {
    if (!this.apiKey) {
      throw new Error('STRIPE_API_KEY is not configured');
    }
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-12-15.clover',
    });
    this.logger.log('Stripe service initialized successfully');
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
    customerId?: string,
    paymentMethodId?: string,
    description?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (metadata) params.metadata = metadata;
      if (customerId) params.customer = customerId;
      if (paymentMethodId) params.payment_method = paymentMethodId;
      if (description) params.description = description;

      const paymentIntent = await this.stripe.paymentIntents.create(params);

      this.logger.log(
        `PaymentIntent created: ${paymentIntent.id} for amount: ${amount} ${currency}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw new InternalServerErrorException(
        `Stripe PaymentIntent creation failed: ${error.message}`,
      );
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
    returnUrl?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {
        return_url: returnUrl || 'https://artium.app/payments/complete',
      };
      if (paymentMethodId) params.payment_method = paymentMethodId;

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        params,
      );

      this.logger.log(`PaymentIntent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to confirm PaymentIntent: ${paymentIntentId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe PaymentIntent confirmation failed: ${error.message}`,
      );
    }
  }

  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.cancel(paymentIntentId);

      this.logger.log(`PaymentIntent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to cancel PaymentIntent: ${paymentIntentId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe PaymentIntent cancellation failed: ${error.message}`,
      );
    }
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve PaymentIntent: ${paymentIntentId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe PaymentIntent retrieval failed: ${error.message}`,
      );
    }
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    try {
      const params: Stripe.CustomerCreateParams = { email };
      if (name) params.name = name;
      if (metadata) params.metadata = metadata;

      const customer = await this.stripe.customers.create(params);

      this.logger.log(`Customer created: ${customer.id} with email: ${email}`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer', error.stack);
      throw new InternalServerErrorException(
        `Stripe customer creation failed: ${error.message}`,
      );
    }
  }

  async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = (await this.stripe.customers.retrieve(
        customerId,
      )) as Stripe.Customer;
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve customer: ${customerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe customer retrieval failed: ${error.message}`,
      );
    }
  }

  async updateCustomer(
    customerId: string,
    email?: string,
    name?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    try {
      const params: Stripe.CustomerUpdateParams = {};
      if (email) params.email = email;
      if (name) params.name = name;
      if (metadata) params.metadata = metadata;

      const customer = await this.stripe.customers.update(customerId, params);

      this.logger.log(`Customer updated: ${customerId}`);
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to update customer: ${customerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe customer update failed: ${error.message}`,
      );
    }
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      const deleted = await this.stripe.customers.del(customerId);

      this.logger.log(`Customer deleted: ${customerId}`);
      return deleted;
    } catch (error) {
      this.logger.error(
        `Failed to delete customer: ${customerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe customer deletion failed: ${error.message}`,
      );
    }
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        },
      );

      this.logger.log(
        `PaymentMethod ${paymentMethodId} attached to customer ${customerId}`,
      );
      return paymentMethod;
    } catch (error) {
      this.logger.error('Failed to attach payment method', error.stack);
      throw new InternalServerErrorException(
        `Stripe payment method attachment failed: ${error.message}`,
      );
    }
  }

  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod =
        await this.stripe.paymentMethods.detach(paymentMethodId);

      this.logger.log(`PaymentMethod detached: ${paymentMethodId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(
        `Failed to detach payment method: ${paymentMethodId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe payment method detachment failed: ${error.message}`,
      );
    }
  }

  async listPaymentMethods(
    customerId: string,
    type: string = 'card',
  ): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: type as any,
      });

      return paymentMethods.data;
    } catch (error) {
      this.logger.error(
        `Failed to list payment methods for customer: ${customerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe payment methods listing failed: ${error.message}`,
      );
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) params.amount = Math.round(amount * 100);
      if (reason) params.reason = reason;
      if (metadata) params.metadata = metadata;

      const refund = await this.stripe.refunds.create(params);

      this.logger.log(
        `Refund created: ${refund.id} for PaymentIntent: ${paymentIntentId}`,
      );
      return refund;
    } catch (error) {
      this.logger.error(
        `Failed to create refund for PaymentIntent: ${paymentIntentId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe refund creation failed: ${error.message}`,
      );
    }
  }

  async retrieveRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to retrieve refund: ${refundId}`, error.stack);
      throw new InternalServerErrorException(
        `Stripe refund retrieval failed: ${error.message}`,
      );
    }
  }

  async createProduct(
    name: string,
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Product> {
    try {
      const params: Stripe.ProductCreateParams = { name };
      if (description) params.description = description;
      if (metadata) params.metadata = metadata;

      const product = await this.stripe.products.create(params);

      this.logger.log(`Product created: ${product.id} - ${name}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to create product', error.stack);
      throw new InternalServerErrorException(
        `Stripe product creation failed: ${error.message}`,
      );
    }
  }

  async createPrice(
    productId: string,
    amount: number,
    currency: string,
    recurring?: { interval: 'day' | 'week' | 'month' | 'year' },
  ): Promise<Stripe.Price> {
    try {
      const params: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
      };

      if (recurring) params.recurring = recurring;

      const price = await this.stripe.prices.create(params);

      this.logger.log(`Price created: ${price.id} for product: ${productId}`);
      return price;
    } catch (error) {
      this.logger.error(
        `Failed to create price for product: ${productId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe price creation failed: ${error.message}`,
      );
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Subscription> {
    try {
      const params: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
      };

      if (metadata) params.metadata = metadata;

      const subscription = await this.stripe.subscriptions.create(params);

      this.logger.log(
        `Subscription created: ${subscription.id} for customer: ${customerId}`,
      );
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription', error.stack);
      throw new InternalServerErrorException(
        `Stripe subscription creation failed: ${error.message}`,
      );
    }
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription =
        await this.stripe.subscriptions.cancel(subscriptionId);

      this.logger.log(`Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription: ${subscriptionId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Stripe subscription cancellation failed: ${error.message}`,
      );
    }
  }

  async createPaymentLink(
    priceId: string,
    quantity: number = 1,
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentLink> {
    try {
      const params: Stripe.PaymentLinkCreateParams = {
        line_items: [{ price: priceId, quantity }],
      };

      if (metadata) params.metadata = metadata;

      const paymentLink = await this.stripe.paymentLinks.create(params);

      this.logger.log(`Payment link created: ${paymentLink.id}`);
      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create payment link', error.stack);
      throw new InternalServerErrorException(
        `Stripe payment link creation failed: ${error.message}`,
      );
    }
  }

  async getBalance(): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve();
      this.logger.log('Balance retrieved successfully');
      return balance;
    } catch (error) {
      this.logger.error('Failed to retrieve balance', error.stack);
      throw new InternalServerErrorException(
        `Stripe balance retrieval failed: ${error.message}`,
      );
    }
  }

  async constructWebhookEvent(
    payload: Buffer | string,
    signature: string,
    webhookSecret: string,
  ): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error.stack);
      throw new BadRequestException(
        `Webhook signature verification failed: ${error.message}`,
      );
    }
  }
}
