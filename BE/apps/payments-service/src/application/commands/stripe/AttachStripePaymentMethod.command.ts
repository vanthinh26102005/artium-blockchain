import { AttachPaymentMethodDTO } from '../../../domain/dtos/stripe';

export class AttachStripePaymentMethodCommand {
  constructor(public readonly data: AttachPaymentMethodDTO) {}
}
