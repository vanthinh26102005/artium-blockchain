import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  SellerAuctionReservePolicy,
  SellerAuctionStartStatus,
} from '@app/common';

jest.mock(
  '@app/blockchain',
  () => ({
    EscrowContractService: class EscrowContractService {},
  }),
  { virtual: true },
);

import { StartSellerAuctionCommand } from '../StartSellerAuction.command';
import { StartSellerAuctionHandler } from './StartSellerAuction.command.handler';

describe('StartSellerAuctionHandler', () => {
  const startAttemptRepo = {
    findLatestBySellerAndArtwork: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const escrowContractService = {
    encodeCreateAuctionCalldata: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };

  let handler: StartSellerAuctionHandler;

  const input = {
    sellerId: 'seller-1',
    artworkId: 'artwork-1',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    artworkTitle: 'Ocean Study',
    creatorName: 'Artium Seller',
    thumbnailUrl: 'https://example.com/art.jpg',
    ipfsMetadataHash: 'QmHash',
    reservePolicy: SellerAuctionReservePolicy.SET,
    reservePriceEth: '1.5',
    minBidIncrementEth: '0.1',
    durationHours: 72,
    shippingDisclosure: 'Ships in 5 business days',
    paymentDisclosure: 'Payment due immediately',
    economicsLockedAcknowledged: true,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      if (key === 'CONTRACT_ADDRESS') {
        return '0x00000000000000000000000000000000000000aa';
      }
      if (key === 'BLOCKCHAIN_RPC_URL') {
        return 'https://rpc.example';
      }
      return null;
    });
    escrowContractService.encodeCreateAuctionCalldata.mockReturnValue('0xdeadbeef');
    handler = new StartSellerAuctionHandler(
      startAttemptRepo as never,
      escrowContractService as never,
      configService as never,
    );
  });

  it('creates a new pending attempt with encoded wallet request data', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue(null as never);
    startAttemptRepo.create.mockImplementation(async (data: any) => ({
      id: 'attempt-1',
      createdAt: new Date('2026-04-27T07:00:00.000Z'),
      updatedAt: new Date('2026-04-27T07:00:00.000Z'),
      ...data,
    }));

    const result = await handler.execute(new StartSellerAuctionCommand({ ...input }));

    expect(startAttemptRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: input.sellerId,
        artworkId: input.artworkId,
        status: SellerAuctionStartStatus.PENDING_START,
        walletActionRequired: true,
        contractAddress: '0x00000000000000000000000000000000000000aa',
        ipfsMetadataHash: 'QmHash',
      }),
    );
    expect(result.status).toBe(SellerAuctionStartStatus.PENDING_START);
    expect(result.transactionRequest).toEqual({
      contractAddress: '0x00000000000000000000000000000000000000aa',
      data: '0xdeadbeef',
    });
    expect(result.submittedTermsSnapshot.durationHours).toBe(72);
    expect(escrowContractService.encodeCreateAuctionCalldata).toHaveBeenCalled();
  });

  it('reuses an existing pending attempt instead of creating a duplicate', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue({
      id: 'attempt-1',
      sellerId: input.sellerId,
      artworkId: input.artworkId,
      orderId: 'AUC-001',
      status: SellerAuctionStartStatus.PENDING_START,
      artworkTitle: input.artworkTitle,
      creatorName: input.creatorName,
      thumbnailUrl: input.thumbnailUrl,
      walletAddress: '0x1234567890AbcdEF1234567890aBcdef12345678',
      contractAddress: '0x00000000000000000000000000000000000000aa',
      txHash: null,
      reasonCode: null,
      reasonMessage: null,
      retryAllowed: false,
      editAllowed: false,
      walletActionRequired: true,
      activatedAt: null,
      durationSeconds: 72 * 60 * 60,
      reservePriceWei: '1500000000000000000',
      minBidIncrementWei: '100000000000000000',
      ipfsMetadataHash: 'QmHash',
      termsSnapshot: {
        reservePolicy: SellerAuctionReservePolicy.SET,
        reservePriceEth: '1.5',
        minBidIncrementEth: '0.1',
        durationHours: 72,
        shippingDisclosure: 'Ships in 5 business days',
        paymentDisclosure: 'Payment due immediately',
        economicsLockedAcknowledged: true,
      },
      createdAt: new Date('2026-04-27T07:00:00.000Z'),
      updatedAt: new Date('2026-04-27T07:00:00.000Z'),
    } as never);

    const result = await handler.execute(new StartSellerAuctionCommand({ ...input }));

    expect(startAttemptRepo.create).not.toHaveBeenCalled();
    expect(result.attemptId).toBe('attempt-1');
    expect(result.orderId).toBe('AUC-001');
    expect(result.status).toBe(SellerAuctionStartStatus.PENDING_START);
  });

  it('does not return wallet calldata for a pending attempt after tx attachment', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue({
      id: 'attempt-1',
      sellerId: input.sellerId,
      artworkId: input.artworkId,
      orderId: 'AUC-001',
      status: SellerAuctionStartStatus.PENDING_START,
      artworkTitle: input.artworkTitle,
      creatorName: input.creatorName,
      thumbnailUrl: input.thumbnailUrl,
      walletAddress: '0x1234567890AbcdEF1234567890aBcdef12345678',
      contractAddress: '0x00000000000000000000000000000000000000aa',
      txHash: '0xabc',
      reasonCode: null,
      reasonMessage: null,
      retryAllowed: false,
      editAllowed: false,
      walletActionRequired: false,
      activatedAt: null,
      durationSeconds: 72 * 60 * 60,
      reservePriceWei: '1500000000000000000',
      minBidIncrementWei: '100000000000000000',
      ipfsMetadataHash: 'QmHash',
      termsSnapshot: {
        reservePolicy: SellerAuctionReservePolicy.SET,
        reservePriceEth: '1.5',
        minBidIncrementEth: '0.1',
        durationHours: 72,
        shippingDisclosure: 'Ships in 5 business days',
        paymentDisclosure: 'Payment due immediately',
        economicsLockedAcknowledged: true,
      },
      createdAt: new Date('2026-04-27T07:00:00.000Z'),
      updatedAt: new Date('2026-04-27T07:00:00.000Z'),
    } as never);

    const result = await handler.execute(new StartSellerAuctionCommand({ ...input }));

    expect(result.status).toBe(SellerAuctionStartStatus.PENDING_START);
    expect(result.walletActionRequired).toBe(false);
    expect(result.txHash).toBe('0xabc');
    expect(result.transactionRequest).toBeNull();
    expect(escrowContractService.encodeCreateAuctionCalldata).not.toHaveBeenCalled();
  });
});
