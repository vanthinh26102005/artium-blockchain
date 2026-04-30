import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  // Stripe Commands
  CreateStripePaymentIntentCommand,
  ConfirmStripePaymentIntentCommand,
  CreateStripeCustomerCommand,
  CreateStripeRefundCommand,
  AttachStripePaymentMethodCommand,
  HandleStripeWebhookCommand,
  // Invoice Commands
  CreateInvoiceCommand,
  UpdateInvoiceCommand,
  CancelInvoiceCommand,
  SaveInvoiceCommand,
  CreateInvoicePaymentIntentCommand,
  SendInvoiceToBuyerCommand,
  // Payout Commands
  CreatePayoutCommand,
  // Payment Commands
  RecordEthereumPaymentCommand,
  // Payment Queries
  GetEthereumQuoteQuery,
  GetPaymentTransactionQuery,
  GetTransactionsByUserQuery,
  GetPaymentMethodsQuery,
  // Invoice Queries
  GetInvoiceQuery,
  GetInvoiceByNumberQuery,
  GetInvoicesBySellerQuery,
  GetInvoicesByCollectorQuery,
  GetOrderInvoiceQuery,
  // Payout Queries
  GetPayoutQuery,
  GetPayoutsBySellerQuery,
} from '../../application';
import { StripeWebhookDto, GetTransactionsDto } from '@app/common';
import {
  CreatePaymentIntentDTO,
  ConfirmPaymentIntentDTO,
  CreateCustomerDTO,
  CreateRefundDTO,
  AttachPaymentMethodDTO,
} from '../../domain/dtos/stripe';
import {
  CreateInvoiceDTO,
  CreateInvoicePaymentIntentDTO,
  UpdateInvoiceDTO,
  SaveInvoiceDTO,
  SendInvoiceToBuyerDTO,
} from '../../domain/dtos/invoice';
import { OrderInvoiceSourceOrderDto } from '@app/common';
import { CreatePayoutDTO } from '../../domain/dtos/payout';
import { RecordEthereumPaymentDTO } from '../../domain/dtos/payment';

@Controller()
export class PaymentsMicroserviceController {
  private readonly logger = new Logger(PaymentsMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ==================== STRIPE OPERATIONS ====================

  @MessagePattern({ cmd: 'create_payment_intent' })
  async createPaymentIntent(@Payload() data: CreatePaymentIntentDTO) {
    this.logger.debug(`Creating payment intent for user: ${data.userId}`);
    return this.commandBus.execute(new CreateStripePaymentIntentCommand(data));
  }

  @MessagePattern({ cmd: 'confirm_payment_intent' })
  async confirmPaymentIntent(@Payload() data: ConfirmPaymentIntentDTO) {
    this.logger.debug(`Confirming payment intent: ${data.paymentIntentId}`);
    return this.commandBus.execute(new ConfirmStripePaymentIntentCommand(data));
  }

  @MessagePattern({ cmd: 'create_stripe_customer' })
  async createStripeCustomer(@Payload() data: CreateCustomerDTO) {
    this.logger.debug(`Creating Stripe customer for user: ${data.userId}`);
    return this.commandBus.execute(new CreateStripeCustomerCommand(data));
  }

  @MessagePattern({ cmd: 'create_refund' })
  async createRefund(@Payload() data: CreateRefundDTO) {
    this.logger.debug(
      `Creating refund for payment intent: ${data.paymentIntentId}`,
    );
    return this.commandBus.execute(new CreateStripeRefundCommand(data));
  }

  @MessagePattern({ cmd: 'attach_payment_method' })
  async attachPaymentMethod(@Payload() data: AttachPaymentMethodDTO) {
    this.logger.debug(
      `Attaching payment method: ${data.paymentMethodId} to customer: ${data.stripeCustomerId}`,
    );
    return this.commandBus.execute(new AttachStripePaymentMethodCommand(data));
  }

  @MessagePattern({ cmd: 'stripe_webhook' })
  async handleStripeWebhook(
    @Payload() data: StripeWebhookDto,
  ): Promise<{ received: boolean }> {
    this.logger.debug('Processing Stripe webhook');
    return this.commandBus.execute(new HandleStripeWebhookCommand(data));
  }

  // ==================== PAYMENT TRANSACTIONS ====================

  @MessagePattern({ cmd: 'get_transactions' })
  async getTransactions(@Payload() data: GetTransactionsDto) {
    this.logger.debug(`Getting transactions for user: ${data.userId}`);
    return this.queryBus.execute(new GetTransactionsByUserQuery(data.userId));
  }

  @MessagePattern({ cmd: 'get_transaction_by_id' })
  async getTransactionById(@Payload() data: { id: string }) {
    this.logger.debug(`Getting transaction by ID: ${data.id}`);
    return this.queryBus.execute(new GetPaymentTransactionQuery(data.id));
  }

  // ==================== PAYMENT METHODS ====================

  @MessagePattern({ cmd: 'get_payment_methods' })
  async getPaymentMethods(@Payload() data: { userId: string }) {
    this.logger.debug(`Getting payment methods for user: ${data.userId}`);
    return this.queryBus.execute(new GetPaymentMethodsQuery(data.userId));
  }

  // ==================== INVOICES ====================

  @MessagePattern({ cmd: 'create_invoice' })
  async createInvoice(@Payload() data: CreateInvoiceDTO) {
    this.logger.debug(`Creating invoice for seller: ${data.sellerId}`);
    return this.commandBus.execute(new CreateInvoiceCommand(data));
  }

  @MessagePattern({ cmd: 'create_invoice_payment_intent' })
  async createInvoicePaymentIntent(
    @Payload() data: CreateInvoicePaymentIntentDTO,
  ) {
    this.logger.debug(
      `Creating invoice payment intent for user: ${data.userId}`,
    );
    return this.commandBus.execute(
      new CreateInvoicePaymentIntentCommand(data),
    );
  }

  @MessagePattern({ cmd: 'save_invoice' })
  async saveInvoice(@Payload() data: SaveInvoiceDTO) {
    this.logger.debug(`Saving invoice for seller: ${data.sellerId}`);
    return this.commandBus.execute(new SaveInvoiceCommand(data));
  }

  @MessagePattern({ cmd: 'update_invoice' })
  async updateInvoice(
    @Payload() data: { invoiceId: string; data: UpdateInvoiceDTO },
  ) {
    this.logger.debug(`Updating invoice: ${data.invoiceId}`);
    return this.commandBus.execute(
      new UpdateInvoiceCommand(data.invoiceId, data.data),
    );
  }

  @MessagePattern({ cmd: 'cancel_invoice' })
  async cancelInvoice(@Payload() data: { invoiceId: string }) {
    this.logger.debug(`Cancelling invoice: ${data.invoiceId}`);
    return this.commandBus.execute(new CancelInvoiceCommand(data.invoiceId));
  }

  @MessagePattern({ cmd: 'get_invoice' })
  async getInvoice(@Payload() data: { invoiceId: string }) {
    this.logger.debug(`Getting invoice: ${data.invoiceId}`);
    return this.queryBus.execute(new GetInvoiceQuery(data.invoiceId));
  }

  @MessagePattern({ cmd: 'get_invoice_by_number' })
  async getInvoiceByNumber(@Payload() data: { invoiceNumber: string }) {
    this.logger.debug(`Getting invoice by number: ${data.invoiceNumber}`);
    return this.queryBus.execute(new GetInvoiceByNumberQuery(data.invoiceNumber));
  }

  @MessagePattern({ cmd: 'get_or_materialize_order_invoice' })
  async getOrMaterializeOrderInvoice(
    @Payload() data: { order: OrderInvoiceSourceOrderDto },
  ) {
    this.logger.debug(`Getting order invoice for order: ${data.order.id}`);
    return this.queryBus.execute(new GetOrderInvoiceQuery(data.order));
  }

  @MessagePattern({ cmd: 'send_invoice_to_buyer' })
  async sendInvoiceToBuyer(@Payload() data: SendInvoiceToBuyerDTO) {
    this.logger.debug(
      `Sending invoice: ${data.invoiceId || data.invoiceNumber}`,
    );
    return this.commandBus.execute(new SendInvoiceToBuyerCommand(data));
  }

  @MessagePattern({ cmd: 'get_invoices_by_seller' })
  async getInvoicesBySeller(@Payload() data: { sellerId: string }) {
    this.logger.debug(`Getting invoices for seller: ${data.sellerId}`);
    return this.queryBus.execute(new GetInvoicesBySellerQuery(data.sellerId));
  }

  @MessagePattern({ cmd: 'get_invoices_by_collector' })
  async getInvoicesByCollector(@Payload() data: { collectorId: string }) {
    this.logger.debug(`Getting invoices for collector: ${data.collectorId}`);
    return this.queryBus.execute(
      new GetInvoicesByCollectorQuery(data.collectorId),
    );
  }

  // ==================== PAYOUTS ====================

  @MessagePattern({ cmd: 'create_payout' })
  async createPayout(@Payload() data: CreatePayoutDTO) {
    this.logger.debug(`Creating payout for seller: ${data.sellerId}`);
    return this.commandBus.execute(new CreatePayoutCommand(data));
  }

  @MessagePattern({ cmd: 'get_payout' })
  async getPayout(@Payload() data: { payoutId: string }) {
    this.logger.debug(`Getting payout: ${data.payoutId}`);
    return this.queryBus.execute(new GetPayoutQuery(data.payoutId));
  }

  @MessagePattern({ cmd: 'get_payouts_by_seller' })
  async getPayoutsBySeller(@Payload() data: { sellerId: string }) {
    this.logger.debug(`Getting payouts for seller: ${data.sellerId}`);
    return this.queryBus.execute(new GetPayoutsBySellerQuery(data.sellerId));
  }

  // ==================== ETHEREUM PAYMENTS ====================

  @MessagePattern({ cmd: 'record_ethereum_payment' })
  async recordEthereumPayment(@Payload() data: RecordEthereumPaymentDTO) {
    this.logger.debug(`Recording Ethereum payment for user: ${data.userId}`);
    return this.commandBus.execute(new RecordEthereumPaymentCommand(data));
  }

  @MessagePattern({ cmd: 'get_ethereum_quote' })
  async getEthereumQuote(@Payload() data: { usdAmount: number }) {
    this.logger.debug(`Generating Ethereum quote for USD amount: ${data.usdAmount}`);
    return this.queryBus.execute(new GetEthereumQuoteQuery(data.usdAmount));
  }
}
