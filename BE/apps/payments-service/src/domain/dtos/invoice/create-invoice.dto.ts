import { InvoiceStatus } from '@app/common';

export interface CreateInvoiceItemDTO {
  artworkId?: string;
  artworkTitle?: string;
  artworkImageUrl?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
}

export interface CreateInvoiceDTO {
  sellerId: string;
  collectorId?: string;
  customerEmail: string;
  invoiceNumber: string;
  status?: InvoiceStatus;
  orderId?: string;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  termsAndConditions?: string;
  items: CreateInvoiceItemDTO[];
}
