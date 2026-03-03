import { CreateCustomerDTO } from '../../../domain/dtos/stripe';

export class CreateStripeCustomerCommand {
  constructor(public readonly data: CreateCustomerDTO) {}
}
