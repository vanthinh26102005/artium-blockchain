/**
 * Invoice lifecycle status
 * Used in: Invoice.status
 */
export enum InvoiceStatus {
  /** Invoice created but not sent */
  DRAFT = 'draft',
  /** Invoice sent to customer */
  SENT = 'sent',
  /** Invoice paid in full */
  PAID = 'paid',
  /** Invoice cancelled */
  CANCELLED = 'cancelled',
}
