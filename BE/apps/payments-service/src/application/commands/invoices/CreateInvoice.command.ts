import { CreateInvoiceDTO } from '../../../domain/dtos';

export class CreateInvoiceCommand {
  constructor(public readonly data: CreateInvoiceDTO) {}
}
