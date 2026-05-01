import { describe, beforeEach, expect, it, jest } from '@jest/globals';
import { RpcException } from '@nestjs/microservices';

import { GetEthereumQuoteQuery } from '../GetEthereumQuote.query';
import { GetEthereumQuoteHandler } from './GetEthereumQuote.query.handler';
import type { EthereumQuoteResponse } from '../../../../infrastructure/services/ethereum-quote.service';

describe('GetEthereumQuoteHandler', () => {
  const quote: EthereumQuoteResponse = {
    quoteId: 'quote-1',
    quoteToken: 'token-1',
    usdAmount: 125.5,
    fiatCurrency: 'USD',
    cryptoCurrency: 'ETH',
    ethAmount: '0.05',
    weiHex: '0xb1a2bc2ec50000',
    usdPerEth: '2510.00',
    provider: 'coinbase',
    chainId: '11155111',
    chainName: 'Sepolia',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    quotedAt: '2026-04-23T00:00:00.000Z',
    expiresAt: '2026-04-23T00:01:00.000Z',
  };

  const ethereumQuoteService = {
    createQuote: jest.fn(),
  };

  let handler: GetEthereumQuoteHandler;

  beforeEach(() => {
    ethereumQuoteService.createQuote = jest.fn();
    handler = new GetEthereumQuoteHandler(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ethereumQuoteService as any,
    );
  });

  it('returns a quote for a valid usd amount', async () => {
    ethereumQuoteService.createQuote = jest.fn(async () => quote);

    await expect(handler.execute(new GetEthereumQuoteQuery(125.5))).resolves.toEqual(
      quote,
    );
    expect(ethereumQuoteService.createQuote).toHaveBeenCalledWith(125.5);
  });

  it('rejects invalid usd amounts before calling the quote service', async () => {
    await expect(handler.execute(new GetEthereumQuoteQuery(0))).rejects.toBeInstanceOf(
      RpcException,
    );
    expect(ethereumQuoteService.createQuote).not.toHaveBeenCalled();
  });

  it('maps provider failures to an rpc exception', async () => {
    ethereumQuoteService.createQuote = jest.fn(async () => {
      throw new Error('coinbase unavailable');
    });

    await expect(handler.execute(new GetEthereumQuoteQuery(125.5))).rejects.toBeInstanceOf(
      RpcException,
    );
  });
});
