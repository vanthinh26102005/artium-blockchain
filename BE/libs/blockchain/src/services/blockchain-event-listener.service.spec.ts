import { BlockchainEventListenerService } from './blockchain-event-listener.service';

describe('BlockchainEventListenerService', () => {
  it('deduplicates events by txHash + logIndex', async () => {
    const processedKeys = new Set<string>();
    const cursor = { listenerId: 'art-auction-escrow-listener', lastProcessedBlock: '0' };

    const processedRepo = {
      exist: jest.fn(async ({ where }) =>
        processedKeys.has(`${where.txHash}:${where.logIndex}`),
      ),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => {
        processedKeys.add(`${data.txHash}:${data.logIndex}`);
        return data;
      }),
    };

    const cursorRepoManager = {
      findOne: jest.fn(async () => cursor),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => Object.assign(cursor, data)),
    };

    const dataSource = {
      transaction: jest.fn(async (cb) =>
        cb({
          getRepository: (entity: { name: string }) =>
            entity.name === 'BlockchainProcessedEvent'
              ? processedRepo
              : cursorRepoManager,
        }),
      ),
    };

    const cursorRepository = {
      findOne: jest.fn(async () => cursor),
      save: jest.fn(async (data) => Object.assign(cursor, data)),
      create: jest.fn((data) => data),
    };

    const outboxService = {
      createOutboxMessage: jest.fn(async () => undefined),
    };

    const service = new BlockchainEventListenerService(
      {
        on: jest.fn(),
        off: jest.fn(),
        removeAllListeners: jest.fn(),
        queryFilter: jest.fn(),
      } as any,
      {
        getNetwork: jest.fn(async () => ({ chainId: 31337n })),
        getBlockNumber: jest.fn(async () => 100),
      } as any,
      {
        contractAddress: '0x1111111111111111111111111111111111111111',
        rpcUrl: 'http://localhost:8545',
        platformPrivateKey: 'test',
      },
      outboxService as any,
      dataSource as any,
      cursorRepository as any,
    );

    const processEvent = (service as any).processEvent.bind(service);
    const meta = {
      txHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      logIndex: 1,
      blockNumber: 99,
    };

    await processEvent('AuctionStarted', ['ORDER-1', '0xseller', 123n], meta);
    await processEvent('AuctionStarted', ['ORDER-1', '0xseller', 123n], meta);

    expect(outboxService.createOutboxMessage).toHaveBeenCalledTimes(1);
    expect(processedRepo.save).toHaveBeenCalledTimes(1);
  });
});
