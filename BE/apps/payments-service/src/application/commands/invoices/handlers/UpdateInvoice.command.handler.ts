import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, InvoiceStatus } from '@app/common';
import { UpdateInvoiceCommand } from '../UpdateInvoice.command';
import { Invoice } from '../../../../domain/entities';
import {
  IInvoiceRepository,
  IInvoiceItemRepository,
} from '../../../../domain/interfaces';

@CommandHandler(UpdateInvoiceCommand)
export class UpdateInvoiceHandler implements ICommandHandler<UpdateInvoiceCommand> {
  private readonly logger = new Logger(UpdateInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IInvoiceItemRepository)
    private readonly invoiceItemRepo: IInvoiceItemRepository,
  ) {}

  async execute(command: UpdateInvoiceCommand): Promise<Invoice | null> {
    try {
      const { invoiceId, data } = command;
      this.logger.log(`Updating invoice: ${invoiceId}`);

      // Check if invoice exists
      const invoice = await this.invoiceRepo.findById(invoiceId);
      if (!invoice) {
        throw RpcExceptionHelper.notFound(
          `Invoice with ID ${invoiceId} not found`,
        );
      }

      // Can only update draft or sent invoices
      if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.CANCELLED
      ) {
        throw RpcExceptionHelper.badRequest(
          `Cannot update invoice with status: ${invoice.status}`,
        );
      }

      // If items are provided, recalculate totals
      if (data.items && data.items.length > 0) {
        // Delete existing items
        await this.invoiceItemRepo.deleteByInvoiceId(invoiceId);

        // Calculate new totals
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

        // Create new items
        const itemsToCreate = data.items.map((item) => {
          const lineTotal = item.quantity * item.unitPrice;
          const itemTaxAmount = item.taxRate
            ? lineTotal * (item.taxRate / 100)
            : 0;

          return {
            invoiceId,
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

        // Update invoice with new totals
        await this.invoiceRepo.update(invoiceId, {
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
        });
      } else {
        // Update invoice without changing items
        await this.invoiceRepo.update(invoiceId, {
          collectorId: data.collectorId,
          customerEmail: data.customerEmail,
          status: data.status,
          dueDate: data.dueDate,
          notes: data.notes,
          termsAndConditions: data.termsAndConditions,
        });
      }

      this.logger.log(`Invoice updated successfully: ${invoiceId}`);

      return this.invoiceRepo.findById(invoiceId);
    } catch (error) {
      this.logger.error(`Failed to update invoice`, error.stack);
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
