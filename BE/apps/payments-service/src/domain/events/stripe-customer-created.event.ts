export class StripeCustomerCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly stripeCustomerId: string,
    public readonly email: string,
    public readonly name?: string,
  ) {}

  static getEventType(): string {
    return 'StripeCustomerCreated';
  }

  toPayload(): Record<string, any> {
    return {
      userId: this.userId,
      stripeCustomerId: this.stripeCustomerId,
      email: this.email,
      name: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
