import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetInvoicesBySellerQuery } from '../GetInvoicesBySeller.query';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@QueryHandler(GetInvoicesBySellerQuery)
export class GetInvoicesBySellerHandler implements IQueryHandler<GetInvoicesBySellerQuery> {
  private readonly logger = new Logger(GetInvoicesBySellerHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoicesBySellerQuery): Promise<Invoice[]> {
    try {
      const { sellerId } = query;
      this.logger.log(`Getting invoices for seller: ${sellerId}`);

      return await this.invoiceRepo.findBySellerId(sellerId);
    } catch (error) {
      this.logger.error(`Failed to get invoices for seller`, error.stack);
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
