import { InvoiceStatus } from '@app/common';
import { CreateInvoiceItemDTO } from './create-invoice.dto';

export interface UpdateInvoiceDTO {
  collectorId?: string;
  customerEmail?: string;
  status?: InvoiceStatus;
  dueDate?: Date;
  notes?: string;
  termsAndConditions?: string;
  items?: CreateInvoiceItemDTO[];
}
