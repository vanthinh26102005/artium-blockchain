import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetInvoiceQuery } from '../GetInvoice.query';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  private readonly logger = new Logger(GetInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceQuery): Promise<Invoice> {
    try {
      const { invoiceId } = query;
      this.logger.log(`Getting invoice: ${invoiceId}`);

      const invoice = await this.invoiceRepo.findById(invoiceId);
      if (!invoice) {
        throw RpcExceptionHelper.notFound(
          `Invoice with ID ${invoiceId} not found`,
        );
      }

      return invoice;
    } catch (error) {
      this.logger.error(`Failed to get invoice`, error.stack);
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
