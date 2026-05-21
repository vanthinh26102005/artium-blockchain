import { ConfirmDeliveryDto } from '@app/common';

export class ConfirmDeliveryCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly data?: ConfirmDeliveryDto,
    public readonly userWalletAddress?: string | null,
  ) {}
}
