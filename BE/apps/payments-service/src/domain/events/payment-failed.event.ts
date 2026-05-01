import { PaymentProvider } from '@app/common';

export class PaymentFailedEvent {
  constructor(
    public readonly payload: {
      transactionId: string;
      userId: string;
      amount: number;
      currency: string;
      failureReason: string;
      provider: PaymentProvider;
      failureCode?: string | null;
      orderId?: string;
      stripePaymentIntentId?: string | null;
      txHash?: string | null;
    },
  ) {}

  static getEventType(): string {
    return 'PaymentFailed';
  }

  toPayload(): Record<string, any> {
    return {
      ...this.payload,
      timestamp: new Date().toISOString(),
    };
  }
}
