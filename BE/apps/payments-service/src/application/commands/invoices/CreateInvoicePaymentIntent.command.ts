import { CreateInvoicePaymentIntentDTO } from '../../../domain/dtos/invoice';

export class CreateInvoicePaymentIntentCommand {
  constructor(public readonly data: CreateInvoicePaymentIntentDTO) {}
}
