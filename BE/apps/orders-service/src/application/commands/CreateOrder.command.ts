import { CreateOrderDto } from '@app/common';

export class CreateOrderCommand {
  constructor(public readonly data: CreateOrderDto) {}
}
