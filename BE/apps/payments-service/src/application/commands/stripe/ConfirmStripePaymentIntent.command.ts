import { ConfirmPaymentIntentDTO } from '../../../domain/dtos/stripe';

export class ConfirmStripePaymentIntentCommand {
  constructor(public readonly data: ConfirmPaymentIntentDTO) {}
}
