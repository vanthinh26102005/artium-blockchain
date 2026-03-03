export interface CreateInvoicePaymentIntentDTO {
  invoiceId?: string;
  invoiceNumber?: string;
  userId: string;
  buyerEmail?: string;
  buyerName?: string;
}
