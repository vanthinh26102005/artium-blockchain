import { CreateRefundDTO } from '../../../domain/dtos/stripe';

export class CreateStripeRefundCommand {
  constructor(public readonly data: CreateRefundDTO) {}
}
