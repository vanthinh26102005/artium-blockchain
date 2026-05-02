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

import { GetSellerAuctionStartStatusQuery } from '../GetSellerAuctionStartStatus.query';
import { GetSellerAuctionStartStatusHandler } from './GetSellerAuctionStartStatus.query.handler';

describe('GetSellerAuctionStartStatusHandler', () => {
  const startAttemptRepo = {
    findLatestBySellerAndArtwork: jest.fn(),
  };
  const escrowContractService = {
    encodeCreateAuctionCalldata: jest.fn(),
  };

  let handler: GetSellerAuctionStartStatusHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    escrowContractService.encodeCreateAuctionCalldata.mockReturnValue(
      '0xfeedface',
    );
    handler = new GetSellerAuctionStartStatusHandler(
      startAttemptRepo as never,
      escrowContractService as never,
    );
  });

  it('returns null when no persisted start attempt exists', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue(
      null as never,
    );

    await expect(
      handler.execute(
        new GetSellerAuctionStartStatusQuery('seller-1', 'artwork-1'),
      ),
    ).resolves.toBeNull();
  });

  it('returns pending lifecycle state with encoded wallet request data', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue({
      id: 'attempt-1',
      sellerId: 'seller-1',
      artworkId: 'artwork-1',
      orderId: 'AUC-001',
      status: SellerAuctionStartStatus.PENDING_START,
      artworkTitle: 'Ocean Study',
      creatorName: 'Artium Seller',
      thumbnailUrl: 'https://example.com/art.jpg',
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

    const result = await handler.execute(
      new GetSellerAuctionStartStatusQuery('seller-1', 'artwork-1'),
    );

    expect(result).not.toBeNull();
    expect(result?.status).toBe(SellerAuctionStartStatus.PENDING_START);
    expect(result?.transactionRequest).toEqual({
      contractAddress: '0x00000000000000000000000000000000000000aa',
      data: '0xfeedface',
    });
    expect(
      escrowContractService.encodeCreateAuctionCalldata,
    ).toHaveBeenCalledWith(
      'AUC-001',
      BigInt(72 * 60 * 60),
      BigInt('1500000000000000000'),
      BigInt('100000000000000000'),
      'QmHash',
    );
  });

  it('omits wallet request data when the pending attempt already has a tx hash', async () => {
    startAttemptRepo.findLatestBySellerAndArtwork.mockResolvedValue({
      id: 'attempt-1',
      sellerId: 'seller-1',
      artworkId: 'artwork-1',
      orderId: 'AUC-001',
      status: SellerAuctionStartStatus.PENDING_START,
      artworkTitle: 'Ocean Study',
      creatorName: 'Artium Seller',
      thumbnailUrl: 'https://example.com/art.jpg',
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

    const result = await handler.execute(
      new GetSellerAuctionStartStatusQuery('seller-1', 'artwork-1'),
    );

    expect(result?.walletActionRequired).toBe(false);
    expect(result?.txHash).toBe('0xabc');
    expect(result?.transactionRequest).toBeNull();
    expect(
      escrowContractService.encodeCreateAuctionCalldata,
    ).not.toHaveBeenCalled();
  });
});
