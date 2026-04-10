import { ethers } from 'ethers';
import { LoginByWalletCommand } from '../LoginByWallet.command';
import { LoginByWalletHandler } from './LoginByWallet.command.handler';

describe('LoginByWalletHandler', () => {
  const userRepository = {
    findByWalletAddress: jest.fn(),
    create: jest.fn(),
  };
  const tokenService = {
    generateTokenPair: jest.fn(),
  };
  const nonceService = {
    verifyAndConsumeNonce: jest.fn(),
  };

  const buildSiweMessage = ({
    domain,
    address,
    uri,
    chainId,
    nonce,
    issuedAt,
  }: {
    domain: string;
    address: string;
    uri: string;
    chainId: number;
    nonce: string;
    issuedAt: Date;
  }) =>
    [
      `${domain} wants you to sign in with your Ethereum account:`,
      address,
      '',
      'Sign in to Artium',
      '',
      `URI: ${uri}`,
      'Version: 1',
      `Chain ID: ${chainId}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt.toISOString()}`,
    ].join('\n');

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SIWE_DOMAIN;
    delete process.env.SIWE_URI;
    delete process.env.SIWE_ALLOWED_CHAIN_IDS;
  });

  it('accepts a valid SIWE message and returns token pair', async () => {
    const wallet = ethers.Wallet.createRandom();
    const nonce = 'nonce-123';
    const message = buildSiweMessage({
      domain: 'localhost',
      address: wallet.address,
      uri: 'http://localhost:3000',
      chainId: 31337,
      nonce,
      issuedAt: new Date(),
    });
    const signature = await wallet.signMessage(message);

    const mockUser = { id: 'user-1', walletAddress: wallet.address.toLowerCase() };
    userRepository.findByWalletAddress.mockResolvedValue(mockUser);
    nonceService.verifyAndConsumeNonce.mockResolvedValue(true);
    tokenService.generateTokenPair.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const handler = new LoginByWalletHandler(
      userRepository as any,
      tokenService as any,
      nonceService as any,
    );

    const result = await handler.execute(
      new LoginByWalletCommand({ message, signature } as any),
    );

    expect(nonceService.verifyAndConsumeNonce).toHaveBeenCalledWith(
      wallet.address,
      nonce,
    );
    expect(result).toEqual({
      user: mockUser,
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('rejects SIWE message on unsupported chain id', async () => {
    process.env.SIWE_ALLOWED_CHAIN_IDS = '31337';

    const wallet = ethers.Wallet.createRandom();
    const message = buildSiweMessage({
      domain: 'localhost',
      address: wallet.address,
      uri: 'http://localhost:3000',
      chainId: 11155111,
      nonce: 'nonce-456',
      issuedAt: new Date(),
    });
    const signature = await wallet.signMessage(message);

    const handler = new LoginByWalletHandler(
      userRepository as any,
      tokenService as any,
      nonceService as any,
    );

    await expect(
      handler.execute(new LoginByWalletCommand({ message, signature } as any)),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Unsupported chain id'),
    });
  });
});
