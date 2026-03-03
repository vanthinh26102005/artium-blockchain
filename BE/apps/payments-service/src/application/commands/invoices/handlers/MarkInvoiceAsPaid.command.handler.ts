import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, InvoiceStatus } from '@app/common';
import { MarkInvoiceAsPaidCommand } from '../MarkInvoiceAsPaid.command';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@CommandHandler(MarkInvoiceAsPaidCommand)
export class MarkInvoiceAsPaidHandler implements ICommandHandler<MarkInvoiceAsPaidCommand> {
  private readonly logger = new Logger(MarkInvoiceAsPaidHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(command: MarkInvoiceAsPaidCommand): Promise<Invoice> {
    try {
      const { invoiceId, paymentTransactionId } = command;
      this.logger.log(
        `Marking invoice ${invoiceId} as paid with transaction ${paymentTransactionId}`,
      );

      const invoice = await this.invoiceRepo.findById(invoiceId);
      if (!invoice) {
        throw RpcExceptionHelper.notFound(
          `Invoice with ID ${invoiceId} not found`,
        );
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw RpcExceptionHelper.badRequest('Invoice is already paid');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw RpcExceptionHelper.badRequest(
          'Cannot mark cancelled invoice as paid',
        );
      }

      const result = await this.invoiceRepo.markAsPaid(
        invoiceId,
        paymentTransactionId,
      );

      this.logger.log(`Invoice marked as paid successfully: ${invoiceId}`);

      return result!;
    } catch (error) {
      this.logger.error(`Failed to mark invoice as paid`, error.stack);
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
