import { StripeWebhookDto } from '@app/common';

export class HandleStripeWebhookCommand {
  constructor(public readonly data: StripeWebhookDto) {}
}
