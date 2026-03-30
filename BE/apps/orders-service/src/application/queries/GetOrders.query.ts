import { GetOrdersDto } from '@app/common';

export class GetOrdersQuery {
  constructor(public readonly filters: GetOrdersDto) {}
}
