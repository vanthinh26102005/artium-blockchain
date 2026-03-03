import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, InvoiceStatus } from '@app/common';
import { CreateInvoiceCommand } from '../CreateInvoice.command';
import { Invoice, InvoiceItem } from '../../../../domain/entities';
import {
  IInvoiceRepository,
  IInvoiceItemRepository,
} from '../../../../domain/interfaces';

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler implements ICommandHandler<CreateInvoiceCommand> {
  private readonly logger = new Logger(CreateInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IInvoiceItemRepository)
    private readonly invoiceItemRepo: IInvoiceItemRepository,
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<Invoice | null> {
    try {
      const { data } = command;
      this.logger.log(
        `Creating invoice for seller: ${data.sellerId}, number: ${data.invoiceNumber}`,
      );

      // Validate invoice number uniqueness
      const existing = await this.invoiceRepo.findByInvoiceNumber(
        data.invoiceNumber,
      );
      if (existing) {
        throw RpcExceptionHelper.badRequest(
          `Invoice number ${data.invoiceNumber} already exists`,
        );
      }

      // Validate items
      if (!data.items || data.items.length === 0) {
        throw RpcExceptionHelper.badRequest(
          'Invoice must have at least one item',
        );
      }

      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;

      data.items.forEach((item) => {
        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;

        if (item.taxRate) {
          taxAmount += lineTotal * (item.taxRate / 100);
        }

        if (item.discountAmount) {
          discountAmount += item.discountAmount;
        }
      });

      const totalAmount = subtotal + taxAmount - discountAmount;

      // Create invoice
      const invoice = await this.invoiceRepo.create({
        sellerId: data.sellerId,
        collectorId: data.collectorId,
        customerEmail: data.customerEmail,
        invoiceNumber: data.invoiceNumber,
        status: data.status || InvoiceStatus.DRAFT,
        orderId: data.orderId,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        currency: data.currency,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
      });

      // Create invoice items
      const itemsToCreate = data.items.map((item) => {
        const lineTotal = item.quantity * item.unitPrice;
        const itemTaxAmount = item.taxRate
          ? lineTotal * (item.taxRate / 100)
          : 0;

        return {
          invoiceId: invoice.id,
          artworkId: item.artworkId,
          artworkTitle: item.artworkTitle,
          artworkImageUrl: item.artworkImageUrl,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal,
          taxRate: item.taxRate,
          taxAmount: itemTaxAmount,
          discountAmount: item.discountAmount,
          notes: item.notes,
          createdAt: new Date(),
        };
      });

      await this.invoiceItemRepo.createMany(itemsToCreate);

      this.logger.log(`Invoice created successfully: ${invoice.id}`);

      // Return invoice with items
      return this.invoiceRepo.findById(invoice.id);
    } catch (error) {
      this.logger.error(`Failed to create invoice`, error.stack);
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
