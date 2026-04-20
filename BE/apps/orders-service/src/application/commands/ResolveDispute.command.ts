import { ResolveDisputeDto } from '@app/common';

export class ResolveDisputeCommand {
  constructor(
    public readonly orderId: string,
    public readonly dto: ResolveDisputeDto,
  ) {}
}
