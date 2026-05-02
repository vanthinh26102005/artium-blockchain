import { HttpStatus, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RpcExceptionHelper } from '@app/common';

import { GetEthereumQuoteQuery } from '../GetEthereumQuote.query';
import { EthereumQuoteService } from '../../../../infrastructure/services/ethereum-quote.service';

@Injectable()
@QueryHandler(GetEthereumQuoteQuery)
export class GetEthereumQuoteHandler implements IQueryHandler<GetEthereumQuoteQuery> {
  constructor(private readonly ethereumQuoteService: EthereumQuoteService) {}

  async execute(query: GetEthereumQuoteQuery) {
    if (!Number.isFinite(query.usdAmount) || query.usdAmount <= 0) {
      throw RpcExceptionHelper.badRequest(
        'usdAmount must be a positive number',
      );
    }

    try {
      return await this.ethereumQuoteService.createQuote(query.usdAmount);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'getError' in error &&
        typeof error.getError === 'function'
      ) {
        throw error;
      }

      throw RpcExceptionHelper.from(
        HttpStatus.BAD_GATEWAY,
        'Failed to fetch Ethereum quote',
      );
    }
  }
}
