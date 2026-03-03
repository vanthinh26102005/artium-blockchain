import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, InvoiceStatus } from '@app/common';
import { SaveInvoiceCommand } from '../SaveInvoice.command';
import { Invoice } from '../../../../domain/entities';
import {
  IInvoiceRepository,
  IInvoiceItemRepository,
} from '../../../../domain/interfaces';

@CommandHandler(SaveInvoiceCommand)
export class SaveInvoiceHandler implements ICommandHandler<SaveInvoiceCommand> {
  private readonly logger = new Logger(SaveInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IInvoiceItemRepository)
    private readonly invoiceItemRepo: IInvoiceItemRepository,
  ) {}

  async execute(command: SaveInvoiceCommand): Promise<Invoice | null> {
    try {
      const { data } = command;
      this.logger.log(
        `Saving invoice for seller: ${data.sellerId}, number: ${data.invoiceNumber}`,
      );

      // If ID is provided, update existing invoice
      if (data.id) {
        return this.updateExistingInvoice(data.id, data);
      }

      // Otherwise, create a new invoice
      return this.createNewInvoice(data);
    } catch (error) {
      this.logger.error(`Failed to save invoice`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }

  private async createNewInvoice(
    data: SaveInvoiceCommand['data'],
  ): Promise<Invoice | null> {
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
    const { subtotal, taxAmount, discountAmount, totalAmount } =
      this.calculateTotals(data.items);

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
    await this.createInvoiceItems(invoice.id, data.items);

    this.logger.log(`Invoice created successfully: ${invoice.id}`);

    return this.invoiceRepo.findById(invoice.id);
  }

  private async updateExistingInvoice(
    invoiceId: string,
    data: SaveInvoiceCommand['data'],
  ): Promise<Invoice | null> {
    const existingInvoice = await this.invoiceRepo.findById(invoiceId);
    if (!existingInvoice) {
      throw RpcExceptionHelper.notFound(
        `Invoice with ID ${invoiceId} not found`,
      );
    }

    // Check if invoice number is being changed and if the new number is unique
    if (data.invoiceNumber !== existingInvoice.invoiceNumber) {
      const invoiceWithNumber = await this.invoiceRepo.findByInvoiceNumber(
        data.invoiceNumber,
      );
      if (invoiceWithNumber && invoiceWithNumber.id !== invoiceId) {
        throw RpcExceptionHelper.badRequest(
          `Invoice number ${data.invoiceNumber} already exists`,
        );
      }
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw RpcExceptionHelper.badRequest(
        'Invoice must have at least one item',
      );
    }

    // Calculate totals
    const { subtotal, taxAmount, discountAmount, totalAmount } =
      this.calculateTotals(data.items);

    // Update invoice
    await this.invoiceRepo.update(invoiceId, {
      sellerId: data.sellerId,
      collectorId: data.collectorId,
      customerEmail: data.customerEmail,
      invoiceNumber: data.invoiceNumber,
      status: data.status,
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

    // Delete existing items and recreate
    await this.invoiceItemRepo.deleteByInvoiceId(invoiceId);
    await this.createInvoiceItems(invoiceId, data.items);

    this.logger.log(`Invoice updated successfully: ${invoiceId}`);

    return this.invoiceRepo.findById(invoiceId);
  }

  private calculateTotals(items: SaveInvoiceCommand['data']['items']) {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    items.forEach((item) => {
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

    return { subtotal, taxAmount, discountAmount, totalAmount };
  }

  private async createInvoiceItems(
    invoiceId: string,
    items: SaveInvoiceCommand['data']['items'],
  ) {
    const itemsToCreate = items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const itemTaxAmount = item.taxRate ? lineTotal * (item.taxRate / 100) : 0;

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
  }
}
