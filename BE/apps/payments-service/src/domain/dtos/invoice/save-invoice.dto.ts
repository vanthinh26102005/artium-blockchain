import { CreateInvoiceDTO } from './create-invoice.dto';

export interface SaveInvoiceDTO extends CreateInvoiceDTO {
  id?: string;
}
