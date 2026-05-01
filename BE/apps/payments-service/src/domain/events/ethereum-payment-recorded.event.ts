export class EthereumPaymentRecordedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly walletAddress: string,
    public readonly txHash: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId?: string,
  ) {}

  static getEventType(): string {
    return 'EthereumPaymentRecorded';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      walletAddress: this.walletAddress,
      txHash: this.txHash,
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    };
  }
}
