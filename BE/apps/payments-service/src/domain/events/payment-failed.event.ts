export class PaymentFailedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly stripePaymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly failureReason: string,
    public readonly failureCode?: string,
  ) {}

  static getEventType(): string {
    return 'PaymentFailed';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      stripePaymentIntentId: this.stripePaymentIntentId,
      amount: this.amount,
      currency: this.currency,
      failureReason: this.failureReason,
      failureCode: this.failureCode,
      timestamp: new Date().toISOString(),
    };
  }
}
