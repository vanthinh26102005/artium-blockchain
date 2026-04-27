import { PaymentProvider } from '@app/common';

export class PaymentSucceededEvent {
  constructor(
    public readonly payload: {
      transactionId: string;
      userId: string;
      amount: number;
      currency: string;
      provider: PaymentProvider;
      orderId?: string;
      invoiceId?: string;
      stripePaymentIntentId?: string | null;
      stripeChargeId?: string | null;
      txHash?: string | null;
    },
  ) {}

  static getEventType(): string {
    return 'PaymentSucceeded';
  }

  toPayload(): Record<string, any> {
    return {
      ...this.payload,
      timestamp: new Date().toISOString(),
    };
  }
}
