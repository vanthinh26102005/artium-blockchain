import { UpdateInvoiceDTO } from '../../../domain/dtos';

export class UpdateInvoiceCommand {
  constructor(
    public readonly invoiceId: string,
    public readonly data: UpdateInvoiceDTO,
  ) {}
}
