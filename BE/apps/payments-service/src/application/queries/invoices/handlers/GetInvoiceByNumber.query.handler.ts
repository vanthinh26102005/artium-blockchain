import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetInvoiceByNumberQuery } from '../GetInvoiceByNumber.query';
import { Invoice } from '../../../../domain/entities';
import { IInvoiceRepository } from '../../../../domain/interfaces';

@QueryHandler(GetInvoiceByNumberQuery)
export class GetInvoiceByNumberHandler
  implements IQueryHandler<GetInvoiceByNumberQuery>
{
  private readonly logger = new Logger(GetInvoiceByNumberHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceByNumberQuery): Promise<Invoice> {
    try {
      const { invoiceNumber } = query;
      this.logger.log(`Getting invoice by number: ${invoiceNumber}`);

      const invoice = await this.invoiceRepo.findByInvoiceNumber(invoiceNumber);
      if (!invoice) {
        throw RpcExceptionHelper.notFound(
          `Invoice with number ${invoiceNumber} not found`,
        );
      }

      return invoice;
    } catch (error) {
      this.logger.error(`Failed to get invoice by number`, error.stack);
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
