import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RpcExceptionHelper } from '@app/common';
import { GetWalletNonceQuery } from '../GetWalletNonce.query';
import { NonceService } from 'apps/identity-service/src/domain';

@QueryHandler(GetWalletNonceQuery)
export class GetWalletNonceHandler implements IQueryHandler<
  GetWalletNonceQuery,
  { nonce: string }
> {
  constructor(private readonly nonceService: NonceService) {}

  async execute(query: GetWalletNonceQuery): Promise<{ nonce: string }> {
    const { address } = query;

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      throw RpcExceptionHelper.badRequest(
        'Invalid Ethereum address format. Must be 42 characters starting with 0x.',
      );
    }

    const nonce = await this.nonceService.generateNonce(address);
    return { nonce };
  }
}
