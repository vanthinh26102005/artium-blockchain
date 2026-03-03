import { SendInvoiceToBuyerDTO } from '../../../domain/dtos/invoice';

export class SendInvoiceToBuyerCommand {
  constructor(public readonly data: SendInvoiceToBuyerDTO) {}
}
