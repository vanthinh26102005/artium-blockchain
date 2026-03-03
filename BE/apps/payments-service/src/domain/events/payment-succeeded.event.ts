export class PaymentSucceededEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly stripePaymentIntentId: string,
    public readonly stripeChargeId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId?: string,
    public readonly invoiceId?: string,
  ) {}

  static getEventType(): string {
    return 'PaymentSucceeded';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      stripePaymentIntentId: this.stripePaymentIntentId,
      stripeChargeId: this.stripeChargeId,
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      invoiceId: this.invoiceId,
      timestamp: new Date().toISOString(),
    };
  }
}
