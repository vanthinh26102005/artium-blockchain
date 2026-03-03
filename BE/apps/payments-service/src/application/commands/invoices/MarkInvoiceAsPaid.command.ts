export class MarkInvoiceAsPaidCommand {
  constructor(
    public readonly invoiceId: string,
    public readonly paymentTransactionId: string,
  ) {}
}
