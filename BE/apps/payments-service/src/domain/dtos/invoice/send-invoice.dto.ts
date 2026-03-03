export interface SendInvoiceToBuyerDTO {
  invoiceId?: string;
  invoiceNumber?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  invoiceUrl?: string;
  senderId?: string;
}
