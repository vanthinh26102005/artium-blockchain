import { CreatePaymentIntentDTO } from '../../../domain/dtos/stripe';

export class CreateStripePaymentIntentCommand {
  constructor(public readonly data: CreatePaymentIntentDTO) {}
}
