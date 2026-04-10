import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, ethers } from 'ethers';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  BLOCKCHAIN_CONFIG,
  BLOCKCHAIN_PROVIDER,
  BlockchainConfig,
  ESCROW_CONTRACT,
} from '../interfaces/blockchain-config.interface';
import { BlockchainEventCursor } from '../entities/blockchain-event-cursor.entity';
import { BlockchainProcessedEvent } from '../entities/blockchain-processed-event.entity';

const EVENT_ROUTING_KEYS: Record<string, string> = {
  AuctionStarted: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
  AuctionEnded: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
  NewBid: RoutingKey.BLOCKCHAIN_BID_NEW,
  ArtShipped: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPED,
  DeliveryConfirmed: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
  DisputeOpened: RoutingKey.BLOCKCHAIN_DISPUTE_OPENED,
  DisputeResolved: RoutingKey.BLOCKCHAIN_DISPUTE_RESOLVED,
  AuctionCancelled: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
  ShippingTimeout: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
  DeliveryTimeout: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
  AuctionExtended: RoutingKey.BLOCKCHAIN_AUCTION_EXTENDED,
  Withdrawn: RoutingKey.BLOCKCHAIN_FUNDS_WITHDRAWN,
};

type EventPayloadExtractor = (...args: any[]) => Record<string, any>;

const EVENT_EXTRACTORS: Record<string, EventPayloadExtractor> = {
  AuctionStarted: (orderId, seller, endTime) => ({
    orderId,
    seller,
    endTime: endTime.toString(),
  }),
  NewBid: (orderId, bidder, amount) => ({
    orderId,
    bidder,
    amount: amount.toString(),
  }),
  AuctionEnded: (orderId, winner, amount) => ({
    orderId,
    winner,
    amount: amount.toString(),
  }),
  ArtShipped: (orderId, seller, trackingHash) => ({
    orderId,
    seller,
    trackingHash,
  }),
  DeliveryConfirmed: (orderId, winner) => ({
    orderId,
    winner,
  }),
  DisputeOpened: (orderId, buyer, reason) => ({
    orderId,
    buyer,
    reason,
  }),
  DisputeResolved: (orderId, arbiter, favorBuyer) => ({
    orderId,
    arbiter,
    favorBuyer,
  }),
  AuctionCancelled: (orderId, reason) => ({
    orderId,
    reason,
  }),
  ShippingTimeout: (orderId, buyer) => ({
    orderId,
    buyer,
  }),
  DeliveryTimeout: (orderId, seller) => ({
    orderId,
    seller,
  }),
  AuctionExtended: (orderId, newEndTime) => ({
    orderId,
    newEndTime: newEndTime.toString(),
  }),
  Withdrawn: (bidder, amount) => ({
    bidder,
    amount: amount.toString(),
  }),
};

type BlockchainEventMeta = {
  txHash: string;
  logIndex: number;
  blockNumber: number;
};

const LISTENER_ID = 'art-auction-escrow-listener';
const DEFAULT_BACKFILL_CHUNK_SIZE = 500;

@Injectable()
export class BlockchainEventListenerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BlockchainEventListenerService.name);
  private readonly backfillChunkSize = (() => {
    const configured = Number(
      process.env.BLOCKCHAIN_BACKFILL_CHUNK_SIZE ?? DEFAULT_BACKFILL_CHUNK_SIZE,
    );
    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_BACKFILL_CHUNK_SIZE;
  })();
  private readonly listeners = new Map<string, (...args: any[]) => Promise<void>>();
  private chainId = 'unknown';

  constructor(
    @Inject(ESCROW_CONTRACT)
    private readonly contract: Contract,
    @Inject(BLOCKCHAIN_PROVIDER)
    private readonly provider: ethers.JsonRpcProvider,
    @Inject(BLOCKCHAIN_CONFIG)
    private readonly blockchainConfig: BlockchainConfig,
    private readonly outboxService: OutboxService,
    private readonly dataSource: DataSource,
    @InjectRepository(BlockchainEventCursor)
    private readonly cursorRepository: Repository<BlockchainEventCursor>,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting blockchain event listeners...');
    const network = await this.provider.getNetwork();
    this.chainId = network.chainId.toString();
    this.logger.log(`Connected chainId=${this.chainId}`);

    await this.ensureCursorExists();
    await this.catchUpToLatestBlock();
    this.registerLiveListeners();
    await this.catchUpToLatestBlock();

    this.logger.log('Blockchain listeners ready (backfill + live)');
  }

  async onModuleDestroy() {
    this.logger.log('Removing blockchain event listeners...');

    for (const [eventName, listener] of this.listeners.entries()) {
      this.contract.off(eventName, listener);
    }
    this.listeners.clear();

    await this.contract.removeAllListeners();
  }

  private registerLiveListeners() {
    for (const eventName of Object.keys(EVENT_ROUTING_KEYS)) {
      const listener = async (...args: any[]) => {
        const { eventArgs, meta } = this.extractLiveEventMeta(args);
        if (!meta) {
          this.logger.warn(`Skip ${eventName}: missing tx metadata from live payload`);
          return;
        }

        await this.processEvent(eventName, eventArgs, meta);
      };

      this.contract.on(eventName, listener);
      this.listeners.set(eventName, listener);
      this.logger.debug(`Registered live listener for: ${eventName}`);
    }
  }

  private extractLiveEventMeta(args: any[]): {
    eventArgs: any[];
    meta: BlockchainEventMeta | null;
  } {
    if (!args.length) {
      return { eventArgs: [], meta: null };
    }

    const maybePayload = args[args.length - 1] as
      | { log?: any }
      | { transactionHash?: string; index?: number; blockNumber?: number };
    const eventLog = 'log' in (maybePayload ?? {}) ? maybePayload.log : maybePayload;

    if (
      !eventLog ||
      typeof eventLog.transactionHash !== 'string' ||
      typeof eventLog.index !== 'number' ||
      typeof eventLog.blockNumber !== 'number'
    ) {
      return { eventArgs: args, meta: null };
    }

    return {
      eventArgs: 'log' in (maybePayload ?? {}) ? args.slice(0, -1) : args,
      meta: {
        txHash: eventLog.transactionHash,
        logIndex: eventLog.index,
        blockNumber: eventLog.blockNumber,
      },
    };
  }

  private async ensureCursorExists() {
    const existing = await this.cursorRepository.findOne({
      where: { listenerId: LISTENER_ID },
    });

    if (existing) {
      return;
    }

    const latestBlock = await this.provider.getBlockNumber();
    await this.cursorRepository.save(
      this.cursorRepository.create({
        listenerId: LISTENER_ID,
        lastProcessedBlock: String(latestBlock),
      }),
    );

    this.logger.log(
      `Initialized blockchain cursor at block=${latestBlock} (first startup baseline)`,
    );
  }

  private async catchUpToLatestBlock() {
    const cursor = await this.cursorRepository.findOne({
      where: { listenerId: LISTENER_ID },
    });
    const lastProcessed = Number(cursor?.lastProcessedBlock ?? 0);
    const latestBlock = await this.provider.getBlockNumber();
    let fromBlock = lastProcessed + 1;

    if (fromBlock > latestBlock) {
      return;
    }

    this.logger.log(
      `Backfilling blockchain events from block=${fromBlock} to block=${latestBlock}`,
    );

    while (fromBlock <= latestBlock) {
      const toBlock = Math.min(
        fromBlock + this.backfillChunkSize - 1,
        latestBlock,
      );

      await this.backfillBlockRange(fromBlock, toBlock);
      await this.updateCursorBlock(toBlock);
      fromBlock = toBlock + 1;
    }
  }

  private async backfillBlockRange(fromBlock: number, toBlock: number) {
    const collected: Array<{
      eventName: string;
      args: any[];
      meta: BlockchainEventMeta;
    }> = [];

    for (const eventName of Object.keys(EVENT_ROUTING_KEYS)) {
      const logs = await this.contract.queryFilter(eventName, fromBlock, toBlock);
      for (const log of logs) {
        if (
          typeof log.transactionHash !== 'string' ||
          typeof log.index !== 'number' ||
          typeof log.blockNumber !== 'number'
        ) {
          continue;
        }

        collected.push({
          eventName,
          args: Array.from(log.args ?? []),
          meta: {
            txHash: log.transactionHash,
            logIndex: log.index,
            blockNumber: log.blockNumber,
          },
        });
      }
    }

    collected.sort((left, right) => {
      if (left.meta.blockNumber !== right.meta.blockNumber) {
        return left.meta.blockNumber - right.meta.blockNumber;
      }
      return left.meta.logIndex - right.meta.logIndex;
    });

    for (const item of collected) {
      await this.processEvent(item.eventName, item.args, item.meta);
    }
  }

  private async processEvent(
    eventName: string,
    eventArgs: any[],
    meta: BlockchainEventMeta,
  ) {
    const routingKey = EVENT_ROUTING_KEYS[eventName];
    const extractor = EVENT_EXTRACTORS[eventName];

    if (!routingKey || !extractor) {
      this.logger.warn(`Unsupported blockchain event: ${eventName}`);
      return;
    }

    const payload = extractor(...eventArgs);
    const aggregateId =
      payload.orderId ?? payload.bidder ?? `${meta.txHash}:${meta.logIndex}`;
    const enrichedPayload = {
      ...payload,
      txHash: meta.txHash,
      logIndex: meta.logIndex,
      blockNumber: String(meta.blockNumber),
      contractAddress: this.blockchainConfig.contractAddress,
      chainId: this.chainId,
    };

    try {
      const published = await this.dataSource.transaction(async (manager) => {
        const processedRepo = manager.getRepository(BlockchainProcessedEvent);
        const cursorRepo = manager.getRepository(BlockchainEventCursor);

        const alreadyProcessed = await processedRepo.exist({
          where: { txHash: meta.txHash, logIndex: meta.logIndex },
        });
        if (alreadyProcessed) {
          return false;
        }

        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'blockchain',
            aggregateId,
            eventType: eventName,
            payload: enrichedPayload,
            exchange: ExchangeName.BLOCKCHAIN_EVENTS,
            routingKey,
          },
          manager,
        );

        await processedRepo.save(
          processedRepo.create({
            txHash: meta.txHash,
            logIndex: meta.logIndex,
            blockNumber: String(meta.blockNumber),
            eventName,
          }),
        );

        const cursor = await cursorRepo.findOne({
          where: { listenerId: LISTENER_ID },
        });
        const currentCursor = Number(cursor?.lastProcessedBlock ?? 0);
        if (!cursor) {
          await cursorRepo.save(
            cursorRepo.create({
              listenerId: LISTENER_ID,
              lastProcessedBlock: String(meta.blockNumber),
            }),
          );
        } else if (meta.blockNumber > currentCursor) {
          cursor.lastProcessedBlock = String(meta.blockNumber);
          await cursorRepo.save(cursor);
        }

        return true;
      });

      if (published) {
        this.logger.log(`Processed on-chain event ${eventName} (${aggregateId})`);
      } else {
        this.logger.debug(
          `Skipped duplicate on-chain event ${eventName} (${meta.txHash}:${meta.logIndex})`,
        );
      }
    } catch (error: any) {
      if (error?.code === '23505') {
        this.logger.debug(
          `Duplicate event race ignored: ${eventName} (${meta.txHash}:${meta.logIndex})`,
        );
        return;
      }

      this.logger.error(
        `Failed to process on-chain event ${eventName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async updateCursorBlock(blockNumber: number) {
    const cursor = await this.cursorRepository.findOne({
      where: { listenerId: LISTENER_ID },
    });

    if (!cursor) {
      await this.cursorRepository.save(
        this.cursorRepository.create({
          listenerId: LISTENER_ID,
          lastProcessedBlock: String(blockNumber),
        }),
      );
      return;
    }

    const current = Number(cursor.lastProcessedBlock);
    if (blockNumber <= current) {
      return;
    }

    cursor.lastProcessedBlock = String(blockNumber);
    await this.cursorRepository.save(cursor);
  }
}
