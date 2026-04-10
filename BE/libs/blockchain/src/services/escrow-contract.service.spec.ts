import { EscrowState } from '@app/common';
import { EscrowContractService } from './escrow-contract.service';

describe('EscrowContractService', () => {
  const contract = {
    getAuction: jest.fn(),
    getAuctionTimeline: jest.fn(),
    pendingReturns: jest.fn(),
    platformFeeBps: jest.fn(),
    connect: jest.fn(),
    createAuction: jest.fn(),
  };

  const signer = {} as any;
  let service: EscrowContractService;

  beforeEach(() => {
    jest.clearAllMocks();
    contract.connect.mockReturnValue(contract);
    service = new EscrowContractService(contract as any, signer);
  });

  it('maps getAuction to core dto fields matching ABI', async () => {
    contract.getAuction.mockResolvedValue({
      seller: '0x1111111111111111111111111111111111111111',
      highestBidder: '0x2222222222222222222222222222222222222222',
      highestBid: 12n,
      startTime: 100n,
      endTime: 200n,
      minBidIncrement: 1n,
      ipfsHash: 'ipfs://core',
      state: 1n,
    });

    const result = await service.getAuction('ORDER-1');

    expect(result).toEqual({
      seller: '0x1111111111111111111111111111111111111111',
      highestBidder: '0x2222222222222222222222222222222222222222',
      highestBid: 12n,
      startTime: 100n,
      endTime: 200n,
      minBidIncrement: 1n,
      ipfsHash: 'ipfs://core',
      state: EscrowState.ENDED,
    });
  });

  it('maps getAuctionTimeline to timeline dto fields matching ABI', async () => {
    contract.getAuctionTimeline.mockResolvedValue({
      trackingHash: 'ipfs://tracking',
      shippingDeadline: 300n,
      deliveryDeadline: 400n,
      disputeDeadline: 500n,
      reservePrice: 999n,
    });

    const result = await service.getAuctionTimeline('ORDER-1');

    expect(result).toEqual({
      trackingHash: 'ipfs://tracking',
      shippingDeadline: 300n,
      deliveryDeadline: 400n,
      disputeDeadline: 500n,
      reservePrice: 999n,
    });
  });
});
