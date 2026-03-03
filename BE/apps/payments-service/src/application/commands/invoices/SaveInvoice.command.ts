import { SaveInvoiceDTO } from '../../../domain/dtos';

export class SaveInvoiceCommand {
  constructor(public readonly data: SaveInvoiceDTO) {}
}
