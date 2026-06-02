import { OpenDisputeDto } from '@app/common';

export class OpenDisputeCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly dto: OpenDisputeDto,
    public readonly userWalletAddress?: string | null,
  ) {}
}
