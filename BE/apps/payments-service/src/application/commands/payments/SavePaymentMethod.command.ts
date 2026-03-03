import { CreatePaymentMethodDTO } from '../../../domain/dtos';

export class SavePaymentMethodCommand {
  constructor(public readonly data: CreatePaymentMethodDTO) {}
}
