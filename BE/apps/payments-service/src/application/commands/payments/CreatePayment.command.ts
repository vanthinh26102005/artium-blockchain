import { CreatePaymentDTO } from '../../../domain/dtos';

export class CreatePaymentCommand {
  constructor(public readonly data: CreatePaymentDTO) {}
}
