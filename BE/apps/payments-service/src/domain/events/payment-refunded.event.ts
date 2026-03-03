export class PaymentRefundedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly stripePaymentIntentId: string,
    public readonly refundAmount: number,
    public readonly currency: string,
    public readonly isPartialRefund: boolean,
    public readonly refundReason?: string,
  ) {}

  static getEventType(): string {
    return 'PaymentRefunded';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      stripePaymentIntentId: this.stripePaymentIntentId,
      refundAmount: this.refundAmount,
      currency: this.currency,
      isPartialRefund: this.isPartialRefund,
      refundReason: this.refundReason,
      timestamp: new Date().toISOString(),
    };
  }
}
