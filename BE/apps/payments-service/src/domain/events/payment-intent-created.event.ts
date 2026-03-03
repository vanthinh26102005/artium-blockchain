export class PaymentIntentCreatedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly stripePaymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId?: string,
    public readonly invoiceId?: string,
  ) {}

  static getEventType(): string {
    return 'PaymentIntentCreated';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      stripePaymentIntentId: this.stripePaymentIntentId,
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      invoiceId: this.invoiceId,
      timestamp: new Date().toISOString(),
    };
  }
}
