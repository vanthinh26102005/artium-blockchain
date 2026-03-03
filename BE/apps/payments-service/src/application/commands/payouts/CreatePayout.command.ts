import { CreatePayoutDTO } from '../../../domain/dtos';

export class CreatePayoutCommand {
  constructor(public readonly data: CreatePayoutDTO) {}
}
