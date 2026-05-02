import { GetAuctionsDto } from '@app/common';

export class GetAuctionsQuery {
  constructor(public readonly filters: GetAuctionsDto) {}
}
