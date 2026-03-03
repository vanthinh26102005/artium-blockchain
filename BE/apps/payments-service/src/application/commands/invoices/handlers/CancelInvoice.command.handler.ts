import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, InvoiceStatus } from '@app/common';
import { CancelInvoiceCommand } from '../CancelInvoice.command';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@CommandHandler(CancelInvoiceCommand)
export class CancelInvoiceHandler implements ICommandHandler<CancelInvoiceCommand> {
  private readonly logger = new Logger(CancelInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(command: CancelInvoiceCommand): Promise<Invoice> {
    try {
      const { invoiceId } = command;
      this.logger.log(`Cancelling invoice: ${invoiceId}`);

      const invoice = await this.invoiceRepo.findById(invoiceId);
      if (!invoice) {
        throw RpcExceptionHelper.notFound(
          `Invoice with ID ${invoiceId} not found`,
        );
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw RpcExceptionHelper.badRequest('Cannot cancel a paid invoice');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw RpcExceptionHelper.badRequest('Invoice is already cancelled');
      }

      const result = await this.invoiceRepo.cancelInvoice(invoiceId);
      this.logger.log(`Invoice cancelled successfully: ${invoiceId}`);

      return result!;
    } catch (error) {
      this.logger.error(`Failed to cancel invoice`, error.stack);
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
