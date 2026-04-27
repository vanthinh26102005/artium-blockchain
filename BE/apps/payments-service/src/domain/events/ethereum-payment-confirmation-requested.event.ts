export class EthereumPaymentConfirmationRequestedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly txHash: string,
  ) {}

  static getEventType(): string {
    return 'EthereumPaymentConfirmationRequested';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      txHash: this.txHash,
      timestamp: new Date().toISOString(),
    };
  }
}
