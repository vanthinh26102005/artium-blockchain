import { IQuery } from '@nestjs/cqrs';

export class GetWalletNonceQuery implements IQuery {
  constructor(public readonly address: string) {}
}
