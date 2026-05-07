import { Injectable } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { ethers } from 'ethers';
import { NonceService } from './nonce.service';

type ParsedSiweMessage = {
  domain: string;
  address: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: Date;
  expirationTime?: Date;
  notBefore?: Date;
};

@Injectable()
export class WalletSignatureService {
  private static readonly ALLOWED_CHAIN_IDS_DEFAULT = '31337,11155111';
  private static readonly MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

  constructor(private readonly nonceService: NonceService) {}

  private parseDateField(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw RpcExceptionHelper.badRequest(
        `Invalid SIWE message: ${fieldName} must be a valid ISO date.`,
      );
    }
    return parsed;
  }

  private parseSiweMessage(message: string): ParsedSiweMessage {
    const lines = message.split('\n').map((line) => line.trim());
    const domainMatch = lines[0]?.match(
      /^(.+)\s+wants you to sign in with your Ethereum account:$/,
    );

    if (!domainMatch?.[1]) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: missing or invalid domain header.',
      );
    }

    const address = lines[1];
    if (!address || !ethers.isAddress(address)) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: missing or invalid Ethereum address.',
      );
    }

    const fieldMap = new Map<string, string>();
    for (const line of lines) {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex <= 0) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      if (value) {
        fieldMap.set(key, value);
      }
    }

    const nonce = fieldMap.get('nonce');
    if (!nonce) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: missing nonce.',
      );
    }

    const chainIdRaw = fieldMap.get('chain id');
    const chainId = Number(chainIdRaw);
    if (!chainIdRaw || !Number.isInteger(chainId) || chainId <= 0) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: missing or invalid chain id.',
      );
    }

    const uri = fieldMap.get('uri');
    if (!uri) {
      throw RpcExceptionHelper.badRequest('Invalid SIWE message: missing URI.');
    }
    try {
      new URL(uri);
    } catch {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: URI is not a valid URL.',
      );
    }

    const version = fieldMap.get('version');
    if (!version || version !== '1') {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: unsupported version.',
      );
    }

    const issuedAtRaw = fieldMap.get('issued at');
    if (!issuedAtRaw) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: missing issued-at.',
      );
    }
    const issuedAt = this.parseDateField(issuedAtRaw, 'issued-at');

    const expirationRaw = fieldMap.get('expiration time');
    const notBeforeRaw = fieldMap.get('not before');

    return {
      domain: domainMatch[1],
      address,
      uri,
      version,
      chainId,
      nonce,
      issuedAt,
      expirationTime: expirationRaw
        ? this.parseDateField(expirationRaw, 'expiration-time')
        : undefined,
      notBefore: notBeforeRaw
        ? this.parseDateField(notBeforeRaw, 'not-before')
        : undefined,
    };
  }

  private validateSiweContext(parsed: ParsedSiweMessage) {
    const now = Date.now();
    if (
      parsed.issuedAt.getTime() >
      now + WalletSignatureService.MAX_CLOCK_SKEW_MS
    ) {
      throw RpcExceptionHelper.unauthorized(
        'Invalid SIWE message: issued-at is in the future.',
      );
    }

    if (parsed.expirationTime && now > parsed.expirationTime.getTime()) {
      throw RpcExceptionHelper.unauthorized('SIWE message has expired.');
    }

    if (
      parsed.notBefore &&
      now + WalletSignatureService.MAX_CLOCK_SKEW_MS <
        parsed.notBefore.getTime()
    ) {
      throw RpcExceptionHelper.unauthorized(
        'SIWE message is not yet valid (not-before).',
      );
    }

    const expectedDomain = process.env.SIWE_DOMAIN;
    if (expectedDomain && parsed.domain !== expectedDomain) {
      throw RpcExceptionHelper.unauthorized('SIWE domain mismatch.');
    }

    const expectedUri = process.env.SIWE_URI;
    if (expectedUri && parsed.uri !== expectedUri) {
      throw RpcExceptionHelper.unauthorized('SIWE URI mismatch.');
    }

    const allowedChainIds = (
      process.env.SIWE_ALLOWED_CHAIN_IDS ??
      WalletSignatureService.ALLOWED_CHAIN_IDS_DEFAULT
    )
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0);

    if (allowedChainIds.length && !allowedChainIds.includes(parsed.chainId)) {
      throw RpcExceptionHelper.unauthorized(
        `Unsupported chain id: ${parsed.chainId}.`,
      );
    }
  }

  async verifySignedMessage(
    message: string,
    signature: string,
  ): Promise<string> {
    const parsedSiwe = this.parseSiweMessage(message);
    this.validateSiweContext(parsedSiwe);

    const nonceValid = await this.nonceService.verifyAndConsumeNonce(
      parsedSiwe.address,
      parsedSiwe.nonce,
    );
    if (!nonceValid) {
      throw RpcExceptionHelper.unauthorized('Invalid or expired nonce.');
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      throw RpcExceptionHelper.unauthorized('Invalid signature.');
    }

    if (recoveredAddress.toLowerCase() !== parsedSiwe.address.toLowerCase()) {
      throw RpcExceptionHelper.unauthorized(
        'Signature does not match the address in the message.',
      );
    }

    return parsedSiwe.address.toLowerCase();
  }
}
