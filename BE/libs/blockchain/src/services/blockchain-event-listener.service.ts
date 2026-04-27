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

// ────────────────────────────────────────────────────
// Event mapping tables
// ────────────────────────────────────────────────────

const EVENT_ROUTING_KEYS: Readonly<Record<string, string>> = {
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

const EVENT_EXTRACTORS: Readonly<Record<string, EventPayloadExtractor>> = {
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

const SUPPORTED_EVENT_NAMES = Object.keys(EVENT_ROUTING_KEYS);

// ────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────

interface BlockchainEventMeta {
  readonly txHash: string;
  readonly logIndex: number;
  readonly blockNumber: number;
}

interface CollectedEvent {
  readonly eventName: string;
  readonly args: any[];
  readonly meta: BlockchainEventMeta;
}

// Postgres unique-violation error code
const PG_UNIQUE_VIOLATION = '23505';

const LISTENER_ID = 'art-auction-escrow-listener';
const DEFAULT_BACKFILL_CHUNK_SIZE = 500;
const DEFAULT_POLL_INTERVAL_MS = 15_000;
const DEFAULT_MAX_BLOCKS_PER_CYCLE = 1_000;
const DEFAULT_RPC_RETRY_ATTEMPTS = 3;
const DEFAULT_RPC_RETRY_BASE_DELAY_MS = 1_500;

// ────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────

@Injectable()
export class BlockchainEventListenerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BlockchainEventListenerService.name);
  private readonly backfillChunkSize: number;
  private readonly liveListenersEnabled: boolean;
  private readonly pollIntervalMs: number;
  private readonly maxBlocksPerCycle: number;
  private readonly rpcRetryAttempts: number;
  private readonly rpcRetryBaseDelayMs: number;
  private readonly listeners = new Map<
    string,
    (...args: any[]) => Promise<void>
  >();
  private chainId = 'unknown';
  private pollTimer: NodeJS.Timeout | null = null;
  private isPollingCatchUp = false;

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
  ) {
    const configured = Number(
      process.env.BLOCKCHAIN_BACKFILL_CHUNK_SIZE ?? DEFAULT_BACKFILL_CHUNK_SIZE,
    );
    this.backfillChunkSize =
      Number.isFinite(configured) && configured > 0
        ? configured
        : DEFAULT_BACKFILL_CHUNK_SIZE;
    this.liveListenersEnabled =
      (process.env.BLOCKCHAIN_ENABLE_LIVE_FILTER_LISTENERS ?? 'false')
        .trim()
        .toLowerCase() === 'true';
    const configuredPollIntervalMs = Number(
      process.env.BLOCKCHAIN_POLL_INTERVAL_MS ?? DEFAULT_POLL_INTERVAL_MS,
    );
    this.pollIntervalMs =
      Number.isFinite(configuredPollIntervalMs) && configuredPollIntervalMs > 0
        ? configuredPollIntervalMs
        : DEFAULT_POLL_INTERVAL_MS;
    const configuredMaxBlocksPerCycle = Number(
      process.env.BLOCKCHAIN_MAX_BLOCKS_PER_CYCLE ??
        DEFAULT_MAX_BLOCKS_PER_CYCLE,
    );
    this.maxBlocksPerCycle =
      Number.isFinite(configuredMaxBlocksPerCycle) &&
      configuredMaxBlocksPerCycle > 0
        ? configuredMaxBlocksPerCycle
        : DEFAULT_MAX_BLOCKS_PER_CYCLE;
    const configuredRetryAttempts = Number(
      process.env.BLOCKCHAIN_RPC_RETRY_ATTEMPTS ?? DEFAULT_RPC_RETRY_ATTEMPTS,
    );
    this.rpcRetryAttempts =
      Number.isFinite(configuredRetryAttempts) && configuredRetryAttempts > 0
        ? configuredRetryAttempts
        : DEFAULT_RPC_RETRY_ATTEMPTS;
    const configuredRetryBaseDelayMs = Number(
      process.env.BLOCKCHAIN_RPC_RETRY_BASE_DELAY_MS ??
        DEFAULT_RPC_RETRY_BASE_DELAY_MS,
    );
    this.rpcRetryBaseDelayMs =
      Number.isFinite(configuredRetryBaseDelayMs) &&
      configuredRetryBaseDelayMs > 0
        ? configuredRetryBaseDelayMs
        : DEFAULT_RPC_RETRY_BASE_DELAY_MS;
  }

  // ── Lifecycle ──────────────────────────────────────

  async onModuleInit() {
    const isEnabled = (process.env.BLOCKCHAIN_LISTENER_ENABLED ?? 'true')
      .trim()
      .toLowerCase();
    if (isEnabled === 'false') {
      this.logger.log(
        'BlockchainEventListenerService disabled by BLOCKCHAIN_LISTENER_ENABLED=false',
      );
      return;
    }

    this.logger.log('Starting blockchain event listeners...');

    const network = await this.provider.getNetwork();
    this.chainId = network.chainId.toString();
    this.logger.log(`Connected chainId=${this.chainId}`);

    await this.ensureCursorExists();

    try {
      await this.catchUpToLatestBlock();
    } catch (err) {
      this.logger.error(
        `Initial backfill failed (RPC error - restart service to retry): ${(err as any)?.shortMessage ?? (err as Error)?.message}`,
      );
    }

    if (this.liveListenersEnabled) {
      this.registerLiveListeners();

      // Re-run to catch events that arrived during listener registration
      try {
        await this.catchUpToLatestBlock();
      } catch (err) {
        this.logger.error(
          `Post-registration backfill failed (RPC error): ${(err as any)?.shortMessage ?? (err as Error)?.message}`,
        );
      }

      this.logger.log('Blockchain listeners ready (backfill + live)');
      return;
    }

    this.startPollingLoop();
    this.logger.log(
      `Blockchain listener running in polling mode (interval=${this.pollIntervalMs}ms, live filters disabled)`,
    );
  }

  async onModuleDestroy() {
    this.logger.log('Removing blockchain event listeners...');

    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    for (const [eventName, listener] of this.listeners.entries()) {
      this.contract.off(eventName, listener);
    }
    this.listeners.clear();

    await this.contract.removeAllListeners();
  }

  // ── Live listener registration ─────────────────────

  private registerLiveListeners() {
    for (const eventName of SUPPORTED_EVENT_NAMES) {
      const listener = async (...args: any[]) => {
        const { eventArgs, meta } = this.extractLiveEventMeta(args);
        if (!meta) {
          this.logger.warn(
            `Skip ${eventName}: missing tx metadata from live payload`,
          );
          return;
        }

        await this.processEvent(eventName, eventArgs, meta);
      };

      this.contract.on(eventName, listener);
      this.listeners.set(eventName, listener);
      this.logger.debug(`Registered live listener for: ${eventName}`);
    }
  }

  private startPollingLoop() {
    const runPoll = async () => {
      if (this.isPollingCatchUp) {
        this.scheduleNextPoll();
        return;
      }

      this.isPollingCatchUp = true;
      try {
        await this.catchUpToLatestBlock();
      } catch (err) {
        this.logger.error(
          `Polling backfill failed (RPC error): ${(err as any)?.shortMessage ?? (err as Error)?.message}`,
        );
      } finally {
        this.isPollingCatchUp = false;
        this.scheduleNextPoll();
      }
    };

    this.scheduleNextPoll(0, runPoll);
  }

  private scheduleNextPoll(
    delayMs = this.pollIntervalMs,
    runPoll?: () => Promise<void>,
  ) {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    const nextPoll =
      runPoll ??
      (async () => {
        await this.startSinglePollCycle();
      });

    this.pollTimer = setTimeout(() => {
      void nextPoll();
    }, delayMs);
  }

  private async startSinglePollCycle() {
    if (this.isPollingCatchUp) {
      this.scheduleNextPoll();
      return;
    }

    this.isPollingCatchUp = true;
    try {
      await this.catchUpToLatestBlock();
    } catch (err) {
      this.logger.error(
        `Polling backfill failed (RPC error): ${(err as any)?.shortMessage ?? (err as Error)?.message}`,
      );
    } finally {
      this.isPollingCatchUp = false;
      this.scheduleNextPoll();
    }
  }

  /**
   * Extract transaction metadata from the ethers.js event callback args.
   *
   * ethers v6 appends either an `EventLog` (with `.log`) or a raw log
   * object as the last argument. We handle both shapes.
   */
  private extractLiveEventMeta(args: any[]): {
    eventArgs: any[];
    meta: BlockchainEventMeta | null;
  } {
    if (!args.length) {
      return { eventArgs: [], meta: null };
    }

    const lastArg = args[args.length - 1] as Record<string, any> | undefined;
    const eventLog =
      lastArg && 'log' in lastArg ? lastArg.log : lastArg;

    if (
      !eventLog ||
      typeof eventLog.transactionHash !== 'string' ||
      typeof eventLog.index !== 'number' ||
      typeof eventLog.blockNumber !== 'number'
    ) {
      return { eventArgs: args, meta: null };
    }

    return {
      eventArgs:
        lastArg && 'log' in lastArg ? args.slice(0, -1) : args,
      meta: {
        txHash: eventLog.transactionHash,
        logIndex: eventLog.index,
        blockNumber: eventLog.blockNumber,
      },
    };
  }

  // ── Cursor management ──────────────────────────────

  private async ensureCursorExists(): Promise<void> {
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

  private async updateCursorBlock(blockNumber: number): Promise<void> {
    await this.cursorRepository
      .createQueryBuilder()
      .update()
      .set({ lastProcessedBlock: String(blockNumber) })
      .where('listenerId = :id AND CAST(lastProcessedBlock AS BIGINT) < :block', {
        id: LISTENER_ID,
        block: blockNumber,
      })
      .execute();
  }

  // ── Backfill / catch-up ────────────────────────────

  private async catchUpToLatestBlock(): Promise<void> {
    const cursor = await this.cursorRepository.findOne({
      where: { listenerId: LISTENER_ID },
    });
    const lastProcessed = Number(cursor?.lastProcessedBlock ?? 0);
    const chainTip = await this.provider.getBlockNumber();
    const latestBlock = Math.min(
      chainTip,
      lastProcessed + this.maxBlocksPerCycle,
    );
    let fromBlock = lastProcessed + 1;

    if (fromBlock > latestBlock) {
      return;
    }

    this.logger.log(
      `Backfilling blockchain events from block=${fromBlock} to block=${latestBlock} (chainTip=${chainTip})`,
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

  private async backfillBlockRange(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    const collected: CollectedEvent[] = [];
    const logs = await this.fetchLogsAdaptive(fromBlock, toBlock);

    for (const log of logs) {
      if (
        typeof log.transactionHash !== 'string' ||
        typeof log.index !== 'number' ||
        typeof log.blockNumber !== 'number'
      ) {
        continue;
      }

      let parsedLog: ethers.LogDescription | null = null;
      try {
        parsedLog = this.contract.interface.parseLog(log);
      } catch {
        continue;
      }

      const eventName = parsedLog?.name;
      if (!parsedLog || !eventName || !SUPPORTED_EVENT_NAMES.includes(eventName)) {
        continue;
      }

      collected.push({
        eventName,
        args: Array.from(parsedLog.args ?? []),
        meta: {
          txHash: log.transactionHash,
          logIndex: log.index,
          blockNumber: log.blockNumber,
        },
      });
    }

    // Process events in on-chain order
    collected.sort((a, b) =>
      a.meta.blockNumber !== b.meta.blockNumber
        ? a.meta.blockNumber - b.meta.blockNumber
        : a.meta.logIndex - b.meta.logIndex,
    );

    for (const item of collected) {
      await this.processEvent(item.eventName, item.args, item.meta);
    }
  }

  private async fetchLogsAdaptive(
    fromBlock: number,
    toBlock: number,
  ): Promise<ethers.Log[]> {
    try {
      return await this.fetchLogsWithRetry(fromBlock, toBlock);
    } catch (error) {
      if (
        fromBlock >= toBlock ||
        !this.isRetryableRpcError(error)
      ) {
        throw error;
      }

      const midBlock = Math.floor((fromBlock + toBlock) / 2);
      this.logger.warn(
        `Splitting blockchain log fetch range ${fromBlock}-${toBlock} into ${fromBlock}-${midBlock} and ${midBlock + 1}-${toBlock}`,
      );

      const leftLogs = await this.fetchLogsAdaptive(fromBlock, midBlock);
      const rightLogs = await this.fetchLogsAdaptive(midBlock + 1, toBlock);
      return [...leftLogs, ...rightLogs];
    }
  }

  private async fetchLogsWithRetry(
    fromBlock: number,
    toBlock: number,
    attempt = 1,
  ): Promise<ethers.Log[]> {
    try {
      return await this.provider.getLogs({
        address: this.blockchainConfig.contractAddress,
        fromBlock,
        toBlock,
      });
    } catch (error) {
      if (attempt >= this.rpcRetryAttempts || !this.isRetryableRpcError(error)) {
        throw error;
      }

      const delayMs = this.rpcRetryBaseDelayMs * 2 ** (attempt - 1);
      this.logger.warn(
        `Retrying blockchain log fetch for blocks ${fromBlock}-${toBlock} in ${delayMs}ms (attempt ${attempt + 1}/${this.rpcRetryAttempts})`,
      );
      await this.sleep(delayMs);
      return this.fetchLogsWithRetry(fromBlock, toBlock, attempt + 1);
    }
  }

  private isRetryableRpcError(error: unknown): boolean {
    const message = `${(error as any)?.shortMessage ?? ''} ${(error as any)?.message ?? ''}`.toLowerCase();
    return (
      message.includes('too many requests') ||
      message.includes('missing response for request') ||
      message.includes('timeout') ||
      message.includes('429')
    );
  }

  private async sleep(delayMs: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // ── Core event processing ──────────────────────────

  private async processEvent(
    eventName: string,
    eventArgs: any[],
    meta: BlockchainEventMeta,
  ): Promise<void> {
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

        return true;
      });

      if (published) {
        this.logger.log(
          `Processed on-chain event ${eventName} (${aggregateId})`,
        );
      } else {
        this.logger.debug(
          `Skipped duplicate on-chain event ${eventName} (${meta.txHash}:${meta.logIndex})`,
        );
      }
    } catch (error: any) {
      if (error?.code === PG_UNIQUE_VIOLATION) {
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
}
