import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcExceptionHelper } from '@app/common';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

const COINBASE_SPOT_URL = 'https://api.coinbase.com/v2/prices/ETH-USD/spot';
const DEFAULT_CHAIN_ID = '11155111';
const DEFAULT_CHAIN_NAME = 'Sepolia';
const DEFAULT_BLOCK_EXPLORER_URL = 'https://sepolia.etherscan.io';
const DEFAULT_QUOTE_TTL_MS = 60_000;

export type EthereumQuoteTokenPayload = {
  quoteId: string;
  usdAmount: number;
  fiatCurrency: 'USD';
  cryptoCurrency: 'ETH';
  ethAmount: string;
  weiHex: string;
  usdPerEth: string;
  provider: 'coinbase';
  chainId: string;
  chainName: string;
  blockExplorerUrl: string;
  quotedAt: string;
  expiresAt: string;
};

export type EthereumQuoteResponse = EthereumQuoteTokenPayload & {
  quoteToken: string;
};

type CoinbaseSpotResponse = {
  data?: {
    amount?: string;
  };
};

@Injectable()
export class EthereumQuoteService {
  private readonly signingSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.signingSecret = this.resolveSigningSecret();
  }

  async createQuote(usdAmount: number): Promise<EthereumQuoteResponse> {
    const normalizedUsdAmount = this.normalizeUsdAmount(usdAmount);
    const usdPerEth = await this.fetchUsdPerEth();
    const quotedAt = new Date();
    const expiresAt = new Date(quotedAt.getTime() + this.getQuoteTtlMs());
    const { chainId, chainName, blockExplorerUrl } = this.getChainConfig();
    const wei = this.convertUsdToWei(normalizedUsdAmount, usdPerEth);

    const payload: EthereumQuoteTokenPayload = {
      quoteId: randomUUID(),
      usdAmount: normalizedUsdAmount,
      fiatCurrency: 'USD',
      cryptoCurrency: 'ETH',
      ethAmount: this.formatWeiAsEth(wei),
      weiHex: `0x${wei.toString(16)}`,
      usdPerEth,
      provider: 'coinbase',
      chainId,
      chainName,
      blockExplorerUrl,
      quotedAt: quotedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    return {
      ...payload,
      quoteToken: this.signPayload(payload),
    };
  }

  verifyQuoteToken(quoteToken: string): EthereumQuoteTokenPayload {
    if (!quoteToken || !quoteToken.includes('.')) {
      throw RpcExceptionHelper.badRequest('Invalid Ethereum quote token');
    }

    const [encodedPayload, signature] = quoteToken.split('.');
    const expectedSignature = this.signEncodedPayload(encodedPayload);

    if (
      signature.length !== expectedSignature.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      throw RpcExceptionHelper.badRequest('Invalid Ethereum quote token');
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<EthereumQuoteTokenPayload>;

      if (
        !payload.quoteId ||
        typeof payload.usdAmount !== 'number' ||
        !payload.ethAmount ||
        !payload.weiHex ||
        !payload.chainId ||
        !payload.quotedAt ||
        !payload.expiresAt
      ) {
        throw new Error('Malformed payload');
      }

      return payload as EthereumQuoteTokenPayload;
    } catch {
      throw RpcExceptionHelper.badRequest('Invalid Ethereum quote token');
    }
  }

  isExpired(payload: Pick<EthereumQuoteTokenPayload, 'expiresAt'>): boolean {
    return new Date(payload.expiresAt).getTime() <= Date.now();
  }

  private async fetchUsdPerEth(): Promise<string> {
    let response: Response;

    try {
      response = await fetch(COINBASE_SPOT_URL, {
        headers: { Accept: 'application/json' },
      });
    } catch {
      throw RpcExceptionHelper.from(
        HttpStatus.BAD_GATEWAY,
        'Failed to reach quote provider',
      );
    }

    if (!response.ok) {
      throw RpcExceptionHelper.from(
        HttpStatus.BAD_GATEWAY,
        'Failed to fetch ETH quote from provider',
      );
    }

    const body = (await response.json()) as CoinbaseSpotResponse;
    const amount = body?.data?.amount?.trim();

    if (!amount || !/^\d+(\.\d+)?$/.test(amount)) {
      throw RpcExceptionHelper.from(
        HttpStatus.BAD_GATEWAY,
        'Quote provider returned an invalid ETH price',
      );
    }

    return amount;
  }

  private normalizeUsdAmount(usdAmount: number): number {
    return Number(usdAmount.toFixed(2));
  }

  private convertUsdToWei(usdAmount: number, usdPerEth: string): bigint {
    const usdCents = BigInt(
      Math.round(this.normalizeUsdAmount(usdAmount) * 100),
    );
    const { units: priceUnits, scale } = this.parseDecimalToUnits(usdPerEth);

    if (usdCents <= 0n || priceUnits <= 0n) {
      throw RpcExceptionHelper.badRequest('Unable to generate Ethereum quote');
    }

    const numerator = usdCents * 10n ** BigInt(scale) * 10n ** 18n;
    const denominator = 100n * priceUnits;
    const wei = (numerator + denominator / 2n) / denominator;

    if (wei <= 0n) {
      throw RpcExceptionHelper.badRequest('Unable to generate Ethereum quote');
    }

    return wei;
  }

  private parseDecimalToUnits(value: string): { units: bigint; scale: number } {
    const normalized = value.trim();
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
      throw RpcExceptionHelper.badRequest('Unable to generate Ethereum quote');
    }

    const [whole, fractional = ''] = normalized.split('.');
    return {
      units: BigInt(`${whole}${fractional}`),
      scale: fractional.length,
    };
  }

  private formatWeiAsEth(wei: bigint): string {
    const whole = wei / 10n ** 18n;
    const fraction = (wei % 10n ** 18n).toString().padStart(18, '0');
    const trimmedFraction = fraction.replace(/0+$/, '');

    return trimmedFraction
      ? `${whole.toString()}.${trimmedFraction}`
      : whole.toString();
  }

  private getChainConfig() {
    return {
      chainId: DEFAULT_CHAIN_ID,
      chainName: DEFAULT_CHAIN_NAME,
      blockExplorerUrl:
        this.configService
          .get<string>('ETHEREUM_CHECKOUT_BLOCK_EXPLORER_URL')
          ?.trim() || DEFAULT_BLOCK_EXPLORER_URL,
    };
  }

  private getQuoteTtlMs(): number {
    const configuredTtl = Number(
      this.configService.get<string>('ETHEREUM_QUOTE_TTL_MS') ??
        DEFAULT_QUOTE_TTL_MS,
    );

    return Number.isFinite(configuredTtl) && configuredTtl > 0
      ? configuredTtl
      : DEFAULT_QUOTE_TTL_MS;
  }

  private resolveSigningSecret(): string {
    const secret = this.configService
      .get<string>('ETHEREUM_QUOTE_SIGNING_SECRET')
      ?.trim();
    if (!secret) {
      throw new Error(
        'ETHEREUM_QUOTE_SIGNING_SECRET must be configured with a strong random secret. ' +
          'Quotes cannot be signed without a secret key.',
      );
    }
    return secret;
  }

  private getSigningSecret(): string {
    return this.signingSecret;
  }

  private signPayload(payload: EthereumQuoteTokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    return `${encodedPayload}.${this.signEncodedPayload(encodedPayload)}`;
  }

  private signEncodedPayload(encodedPayload: string): string {
    return createHmac('sha256', this.getSigningSecret())
      .update(encodedPayload)
      .digest('base64url');
  }
}
