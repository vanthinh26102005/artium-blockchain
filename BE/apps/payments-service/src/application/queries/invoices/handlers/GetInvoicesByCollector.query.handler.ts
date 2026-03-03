import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetInvoicesByCollectorQuery } from '../GetInvoicesByCollector.query';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@QueryHandler(GetInvoicesByCollectorQuery)
export class GetInvoicesByCollectorHandler implements IQueryHandler<GetInvoicesByCollectorQuery> {
  private readonly logger = new Logger(GetInvoicesByCollectorHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoicesByCollectorQuery): Promise<Invoice[]> {
    try {
      const { collectorId } = query;
      this.logger.log(`Getting invoices for collector: ${collectorId}`);

      return await this.invoiceRepo.findByCollectorId(collectorId);
    } catch (error) {
      this.logger.error(`Failed to get invoices for collector`, error.stack);
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
