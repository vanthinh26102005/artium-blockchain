import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';

import { EthereumQuoteService } from './ethereum-quote.service';

describe('EthereumQuoteService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('creates a signed Sepolia quote with exact wei formatting', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ data: { amount: '2500.00' } }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new EthereumQuoteService(
      new ConfigService({
        ETHEREUM_QUOTE_SIGNING_SECRET: 'test-secret',
      }),
    );

    const quote = await service.createQuote(150.25);
    const verified = service.verifyQuoteToken(quote.quoteToken);

    expect(quote.usdAmount).toBe(150.25);
    expect(quote.chainId).toBe('11155111');
    expect(quote.chainName).toBe('Sepolia');
    expect(quote.ethAmount).toBe('0.0601');
    expect(quote.weiHex).toBe('0xd584a1af004000');
    expect(verified.quoteId).toBe(quote.quoteId);
    expect(new Date(quote.expiresAt).getTime()).toBeGreaterThan(
      new Date(quote.quotedAt).getTime(),
    );
  });

  it('rejects when the provider response fails', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new EthereumQuoteService(new ConfigService());

    await expect(service.createQuote(150.25)).rejects.toBeDefined();
  });
});
