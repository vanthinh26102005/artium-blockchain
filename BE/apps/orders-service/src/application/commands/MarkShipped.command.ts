import { MarkShippedDto } from '@app/common';

export class MarkShippedCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly data: MarkShippedDto,
  ) {}
}
