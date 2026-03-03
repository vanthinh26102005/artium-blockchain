export class PaymentMethodAttachedEvent {
  constructor(
    public readonly userId: string,
    public readonly paymentMethodId: string,
    public readonly stripePaymentMethodId: string,
    public readonly type: string,
    public readonly lastFour?: string,
    public readonly brand?: string,
  ) {}

  static getEventType(): string {
    return 'PaymentMethodAttached';
  }

  toPayload(): Record<string, any> {
    return {
      userId: this.userId,
      paymentMethodId: this.paymentMethodId,
      stripePaymentMethodId: this.stripePaymentMethodId,
      type: this.type,
      lastFour: this.lastFour,
      brand: this.brand,
      timestamp: new Date().toISOString(),
    };
  }
}
