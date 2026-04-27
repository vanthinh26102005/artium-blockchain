# Phase 20: Auction start orchestration and seller lifecycle status - Pattern Map

**Mapped:** 2026-04-27  
**Files analyzed:** 16 likely new/modified files  
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` | component | request-response | `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` | exact |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx` | component | request-response | `FE/artium-web/src/@domains/auction/components/PendingBidState.tsx` + `SellerAuctionTermsPreview.tsx` | partial |
| `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts` | hook | request-response | `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts` | role-match |
| `FE/artium-web/src/@domains/auction/services/auctionStartWallet.ts` | service | request-response | `FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts` | role-match |
| `FE/artium-web/src/@shared/apis/auctionApis.ts` | utility | request-response | `FE/artium-web/src/@shared/apis/auctionApis.ts` + `orderApis.ts` | exact |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` | component | transform | `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` | exact |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx` | component | transform | `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx` | exact |
| `FE/artium-web/src/@domains/inventory/types/inventoryArtwork.ts` | model | transform | `FE/artium-web/src/@domains/inventory/types/inventoryArtwork.ts` | exact |
| `FE/artium-web/src/@domains/inventory/utils/inventoryApiMapper.ts` | utility | transform | `FE/artium-web/src/@domains/inventory/utils/inventoryApiMapper.ts` | exact |
| `FE/artium-web/src/@domains/orders/components/OrderStatusBadge.tsx` | component | transform | `FE/artium-web/src/@domains/orders/components/OrderStatusBadge.tsx` | exact |
| `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` | utility | transform | `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` | exact |
| `BE/libs/common/src/dtos/auctions/start-seller-auction.dto.ts` | model | request-response | `BE/libs/common/src/dtos/orders/create-order.dto.ts` | role-match |
| `BE/libs/common/src/dtos/auctions/seller-auction-start-status.dto.ts` | model | request-response | `BE/libs/common/src/dtos/auctions/auction-read.dto.ts` + `seller-auction-artwork-candidates.dto.ts` | role-match |
| `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` | controller | request-response | `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` | exact |
| `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts` | controller | request-response | `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts` | exact |
| `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction*.ts` | service | request-response | `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts` | role-match |
| `BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.ts` | service | request-response | `BE/apps/orders-service/src/application/queries/handlers/GetOrders.query.handler.ts` + `GetAuctionById.query.handler.ts` | role-match |
| `BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts` | model | CRUD | `BE/apps/orders-service/src/domain/entities/orders.entity.ts` | role-match |
| `BE/apps/orders-service/src/domain/interfaces/auction-start-attempt.repository.interface.ts` | utility | CRUD | `BE/apps/orders-service/src/domain/interfaces/order.repository.interface.ts` | role-match |
| `BE/apps/orders-service/src/infrastructure/repositories/auction-start-attempt.repository.ts` | utility | CRUD | `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts` | role-match |
| `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` | service | event-driven | `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` | exact |
| `BE/apps/orders-service/src/app.module.ts` | config | request-response | `BE/apps/orders-service/src/app.module.ts` | exact |

## Pattern Assignments

### `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`

**Analog:** `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`

**Route + seller gate** (`lines 538-547`):
```tsx
export const SellerAuctionArtworkPickerPage = () => {
  const user = useAuthStore((state) => state.user)
  const isSeller = user?.roles?.includes('seller') ?? false

  if (!isSeller) {
    return <SellerProfileRequired />
  }

  return <SellerCandidateWorkspace />
}
```

**Two-step workspace + selected artwork summary** (`lines 237-317`, `402-452`): keep this file as the orchestration page owner; insert the lifecycle shell above the form/preview grid instead of creating a new route.

### `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx`

**Analog:** `FE/artium-web/src/@domains/auction/components/PendingBidState.tsx`

**Tx hash + explorer row** (`lines 34-40`, `116-173`):
```tsx
const formatTransactionHash = (value: string) => `${value.slice(0, 7)}...${value.slice(-4)}`

const getTransactionUrl = (transactionHash: string) =>
  `${WALLET_TARGET_CHAIN.blockExplorerUrl}/tx/${encodeURIComponent(transactionHash)}`
```

```tsx
<div className="flex items-center justify-between gap-4 pt-4">
  <span className="text-[11px] tracking-[0.1em] text-black/48 uppercase">
    Transaction Hash
  </span>
  <span className="font-mono text-xs text-black/72">
    {formatTransactionHash(transactionHash)}
  </span>
</div>
...
<a href={getTransactionUrl(transactionHash)} target="_blank" rel="noreferrer">
  View Transaction
</a>
```

**Snapshot/checklist rail styling** (`SellerAuctionTermsPreview.tsx:43-58`, `101-175`): reuse the rounded card + checklist-row treatment for pending/active/failed/retryable seller status.

### `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts`

**Analog:** `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts`

**Async hook shape** (`lines 16-50`):
```ts
const toError = (error: unknown) =>
  error instanceof Error ? error : new Error('Unable to load auction eligibility.')

const refresh = useCallback(async () => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await auctionApis.getSellerArtworkCandidates()
    setData(response)
  } catch (err) {
    setError(toError(err))
  } finally {
    setIsLoading(false)
  }
}, [])
```

Use the same `data/isLoading/error/refresh` contract for persisted seller start status.

### `FE/artium-web/src/@domains/auction/services/auctionStartWallet.ts`

**Analog:** `FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts`

**Provider + account + send transaction pattern** (`lines 38-44`, `111-168`):
```ts
const getProvider = (): EthereumProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new AuctionBidWalletError('missing_wallet', 'MetaMask is required to place a bid.')
  }

  return window.ethereum
}
```

```ts
const chainId = await provider.request<string>({ method: 'eth_chainId' })
...
accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' })
...
const txHash = await provider.request<string>({
  method: 'eth_sendTransaction',
  params: [{ from: walletAddress, to: contractAddress, value, data }],
})
```

**Chain switch fallback** (`useWalletLogin.ts:270-360`): copy the `wallet_switchEthereumChain` then `wallet_addEthereumChain` fallback before auction activation.

### `FE/artium-web/src/@shared/apis/auctionApis.ts`

**Analog:** `FE/artium-web/src/@shared/apis/auctionApis.ts` + `FE/artium-web/src/@shared/apis/orderApis.ts`

**Query builder + authenticated fetch style** (`auctionApis.ts:91-123`):
```ts
const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams()
  ...
  return queryString.length > 0 ? `?${queryString}` : ''
}

getSellerArtworkCandidates: async (): Promise<SellerAuctionArtworkCandidatesResponse> => {
  return apiFetch<SellerAuctionArtworkCandidatesResponse>('/auctions/seller/artwork-candidates', {
    cache: 'no-store',
  })
},
```

**POST/PATCH method style** (`orderApis.ts:125-170`):
```ts
createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
  return apiPost<OrderResponse>('/orders', data)
},
...
return apiFetch<OrderResponse>(`/orders/${id}/ship`, {
  method: 'PATCH',
  body: JSON.stringify(data),
})
```

Use this for `startSellerAuction`, `submitSellerAuctionTx`, and `getSellerAuctionStartStatus`.

### `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx`

**Analog:** `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx`

**Inline validation + alert block** (`lines 85-92`):
```tsx
{hasSubmitted && hasErrors ? (
  <div
    className="mt-6 rounded-[24px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm font-medium text-[#FF4337]"
    role="alert"
  >
    Review auction terms before continuing.
  </div>
) : null}
```

**Action row to lock during submit/active state** (`lines 371-401`): disable `Back to artwork`, `Save Draft`, and `Start Auction` from this same footer instead of moving actions elsewhere.

### `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx`

**Analog:** `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx`

**Sticky preview rail** (`lines 71-177`):
```tsx
<aside className="rounded-[32px] border border-black/10 bg-white p-6 md:p-8 lg:sticky lg:top-8">
```

**Checklist rows** (`lines 43-58`, `170-174`):
```tsx
const ChecklistRow = ({ label, complete }) => (
  <div className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm ${
    complete ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F7F7F7] text-[#191414]/65'
  }`}>
```

Reuse this rail as the frozen submitted snapshot for pending/failed/retryable/active states.

### `FE/artium-web/src/@domains/inventory/types/inventoryArtwork.ts` and `utils/inventoryApiMapper.ts`

**Analog:** same files

**Type expansion point** (`inventoryArtwork.ts:3-16`):
```ts
export type InventoryArtwork = {
  id: string
  title: string
  creatorName: string
  status: InventoryArtworkStatus
  backendStatus?: string
  ...
}
```

**Mapper pattern** (`inventoryApiMapper.ts:30-50`):
```ts
const resolveDisplayStatus = (item: ArtworkApiItem) => {
  if (item.displayStatus) {
    return item.displayStatus
  }

  return item.status === 'DRAFT' ? 'Draft' : 'Hidden'
}

export const mapArtworkToInventory = (item: ArtworkApiItem): InventoryArtwork => {
  return {
    id: item.id,
    ...
    status: resolveDisplayStatus(item),
    backendStatus: item.status,
  }
}
```

Add seller-only auction lifecycle badge fields here, then render them through existing inventory list/grid badge slots.

### `FE/artium-web/src/@domains/orders/components/OrderStatusBadge.tsx` and `utils/orderPresentation.ts`

**Analog:** same files

**Badge wrapper** (`OrderStatusBadge.tsx:9-16`):
```tsx
<Badge
  variant="outline"
  className={cn('border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', getStatusTone(status))}
>
  {getOrderStatusLabel(status)}
</Badge>
```

**Status-label/tone registry** (`orderPresentation.ts:16-27`, `114-130`):
```ts
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  ...
  auction_active: 'Auction Active',
}
```

```ts
export const getStatusTone = (status?: string | null) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    ...
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
```

Follow this exact registry-driven approach for seller lifecycle badges (`pending_start`, `retry_available`, etc.).

### `BE/libs/common/src/dtos/auctions/start-seller-auction.dto.ts`

**Analog:** `BE/libs/common/src/dtos/orders/create-order.dto.ts`

**DTO style** (`lines 13-55`, `89-134`):
```ts
export class OrderItemDto {
  @ApiProperty(...)
  @IsString()
  @IsNotEmpty()
  artworkId: string;
  ...
}
```

```ts
export class CreateOrderDto {
  @ApiProperty(...)
  @IsString()
  @IsNotEmpty({ message: 'Seller ID is required' })
  sellerId: string;
  ...
}
```

Use `class-validator` + `@ApiProperty` on every seller-auction start field; keep gateway validation declarative.

### `BE/libs/common/src/dtos/auctions/seller-auction-start-status.dto.ts`

**Analog:** `BE/libs/common/src/dtos/auctions/auction-read.dto.ts` + `seller-auction-artwork-candidates.dto.ts`

**Response-object style** (`auction-read.dto.ts:38-94`):
```ts
export class AuctionReadObject {
  @ApiProperty({ description: 'Stable auction identifier used by API and socket rooms' })
  auctionId!: string;
  ...
  @ApiPropertyOptional({ description: 'Last relevant blockchain transaction hash' })
  txHash?: string | null;
}
```

**Nested seller-facing reason objects** (`seller-auction-artwork-candidates.dto.ts:18-82`):
```ts
export class SellerAuctionArtworkRecoveryActionObject {
  @ApiProperty({ enum: SellerAuctionArtworkEligibilityReason })
  reasonCode!: SellerAuctionArtworkEligibilityReason;
  ...
}
```

Model seller lifecycle status as Swagger-first objects with nested reason/recovery metadata.

### `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts`

**Analog:** same file

**Seller-authenticated route pattern** (`lines 107-139`):
```ts
@Get('seller/artwork-candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
async getSellerArtworkCandidates(@Req() req: any) {
  const sellerId = req.user?.id;
  if (!sellerId) {
    throw new UnauthorizedException('Authenticated seller is required');
  }
  ...
}
```

**RPC forwarding pattern** (`lines 99-104`, `123-139`):
```ts
return sendRpc<PaginatedAuctionsObject>(
  this.ordersClient,
  { cmd: 'get_auctions' },
  query,
);
```

Add Phase 20 seller start/status endpoints here; keep auth in gateway and orchestration in orders-service.

### `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts`

**Analog:** same file

**MessagePattern -> command/query bus** (`lines 38-69`):
```ts
@MessagePattern({ cmd: 'get_auctions' })
async getAuctions(@Payload() data: GetAuctionsDto) {
  this.logger.debug('Getting auctions');
  return this.queryBus.execute(new GetAuctionsQuery(data));
}
```

**Inline payload guard before command** (`lines 84-106`):
```ts
if (!data.status) {
  throw RpcExceptionHelper.badRequest('Status is required for order update');
}
...
return this.commandBus.execute(
  new UpdateOrderStatusCommand(data.id, data.status as OrderStatus, {
    trackingNumber: data.trackingNumber,
    notes: data.notes,
  }),
);
```

Use the same controller for `start_seller_auction_*` commands and seller status queries.

### `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction*.ts`

**Analog:** `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts`

**Handler shape + error policy** (`lines 17-81`):
```ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);
  ...
  async execute(command: CreateOrderCommand): Promise<Order | null> {
    try {
      ...
    } catch (error) {
      this.logger.error(`Failed to create order`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
```

Use this exact try/catch structure for idempotent preflight, tx registration, retry, and status transitions.

### `BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.ts`

**Analog:** `GetOrders.query.handler.ts` + `GetAuctionById.query.handler.ts`

**Repository-backed seller query** (`GetOrders.query.handler.ts:18-58`):
```ts
if (filters.sellerId) {
  return this.orderRepo.findBySellerIdViaItems(
    filters.sellerId,
    {
      skip: filters.skip,
      take: filters.take ?? 20,
      status: filters.status,
      onChainOrderId: filters.onChainOrderId,
      escrowState: filters.escrowState,
      paymentMethod: filters.paymentMethod,
    },
  );
}
```

**Single-record lookup + reuse mapper** (`GetAuctionById.query.handler.ts:24-42`):
```ts
const order =
  (await this.orderRepo.findByOnChainOrderId(auctionId)) ??
  (await this.orderRepo.findById(auctionId));
...
const auction = await this.getAuctionsHandler.toAuctionReadObject(
  order,
  new GetAuctionsDto(),
  0,
);
```

Use repository lookup first, then map to a dedicated seller status read object.

### `BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts`

**Analog:** `BE/apps/orders-service/src/domain/entities/orders.entity.ts`

**Entity/index/column style** (`lines 11-24`, `159-172`):
```ts
@Entity({ name: 'orders' })
@Index(['collectorId', 'status'])
@Index(['createdAt'])
export class Order extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id!: string;
```

```ts
@Column({ name: 'on_chain_order_id', type: 'varchar', nullable: true, unique: true })
onChainOrderId?: string | null;

@Column({ name: 'tx_hash', type: 'varchar', length: 66, nullable: true })
txHash?: string | null;
```

Model the new aggregate the same way: explicit snake_case columns, UUID PK, indexes on seller/artwork/status, nullable `tx_hash` and on-chain ids.

### `BE/apps/orders-service/src/domain/interfaces/auction-start-attempt.repository.interface.ts` and `infrastructure/repositories/auction-start-attempt.repository.ts`

**Analog:** `order.repository.interface.ts` + `order.repository.ts`

**Interface contract** (`order.repository.interface.ts:10-54`):
```ts
export const IOrderRepository = Symbol('IOrderRepository');

export interface IOrderRepository extends IRepository<Order, string> {
  findByOnChainOrderId(...): Promise<Order | null>;
  findBySellerIdViaItems(...): Promise<{ data: Order[]; total: number }>;
  findActiveArtworkLocks(...): Promise<string[]>;
}
```

**Repository implementation style** (`order.repository.ts:23-43`, `169-235`):
```ts
@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ormRepository: Repository<Order>,
  ) {}
```

```ts
const qb = repo
  .createQueryBuilder('order')
  .innerJoin('order_items', 'item', 'item.order_id = order.order_id')
  .where('item.seller_id = :sellerId', { sellerId })
  .distinct(true)
  .orderBy('order.created_at', 'DESC');
```

Copy this repository pattern directly for seller-scoped attempt lookup and idempotency checks.

### `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts`

**Analog:** same file

**AuctionStarted convergence** (`lines 33-82`):
```ts
@RabbitSubscribe({
  exchange: ExchangeName.BLOCKCHAIN_EVENTS,
  routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
  queue: 'orders-service.blockchain.auction-started',
  queueOptions: { durable: true },
})
async handleAuctionStarted(message: { orderId: string; seller: string; endTime: string; }) {
  ...
  const existing = await this.orderRepo.findByOnChainOrderId(message.orderId);
  ...
  await this.orderRepo.update(existing.id, {
    status: OrderStatus.AUCTION_ACTIVE,
    paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
    paymentStatus: OrderPaymentStatus.UNPAID,
    sellerWallet: message.seller,
    escrowState: EscrowState.STARTED,
    estimatedDeliveryDate,
  });
}
```

Phase 20 should update the attempt aggregate here too, not from FE optimism.

### `BE/apps/orders-service/src/app.module.ts`

**Analog:** same file

**Handler/repository registration pattern** (`lines 55-121`):
```ts
export const CommandHandlers = [CreateOrderHandler, ...];
export const QueryHandlers = [GetAuctionsHandler, ...];
export const Repositories = [
  { provide: IOrderRepository, useClass: OrderRepository },
];
...
providers: [
  ...CommandHandlers,
  ...QueryHandlers,
  ...Repositories,
  ...Services,
  ...EventHandlers,
],
```

Register new attempt entity, repository provider, command handlers, and query handlers here.

## Shared Patterns

### Seller auth + gateway ownership
**Source:** `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts:107-139`
Apply `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.SELLER)`, and `req.user?.id` extraction on every seller-only Phase 20 gateway route.

### CQRS handler error handling
**Source:** `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts:28-79`, `GetAuctions.query.handler.ts:41-92`
Use `Logger`, `try/catch`, pass through `RpcException`, convert `HttpException` with `RpcExceptionHelper`, fallback to `internalError`.

### Wallet chain/account/transaction flow
**Source:** `FE/artium-web/src/@domains/auth/hooks/useWalletLogin.ts:270-360`, `FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts:111-168`
Always: verify chain -> request accounts -> submit `eth_sendTransaction` -> map rejection to user-safe error codes.

### Event dedupe + outbox
**Source:** `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts:599-631`, `BE/libs/outbox/src/outbox.service.ts:15-66`
Publish blockchain-derived updates inside a DB transaction, check processed-event uniqueness first, then persist outbox message and processed marker together.

### Seller candidate and lock policy reuse
**Source:** `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts:14-189`, `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts:43-90`
Do not duplicate seller artwork eligibility rules in FE or orchestration handlers; reuse candidate query + active-order-lock merge.

### Inventory/order badge rendering
**Source:** `FE/artium-web/src/@domains/orders/components/OrderStatusBadge.tsx:9-16`, `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts:16-27,114-130`, `FE/artium-web/src/@domains/inventory/components/InventoryArtworkList.tsx:142-151`
Represent lifecycle badges through central status-label/tone maps, then render with the existing small rounded badge treatment.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts` | model | CRUD | No dedicated seller-only orchestration aggregate exists yet; use `orders.entity.ts` as the closest persistence scaffold only. |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx` | component | request-response | No existing seller inline lifecycle shell exists; combine `PendingBidState.tsx` transaction treatment with `SellerAuctionTermsPreview.tsx` snapshot/checklist layout. |

## Metadata

**Analog search scope:** `FE/artium-web/src/@domains/auction`, `FE/artium-web/src/@domains/inventory`, `FE/artium-web/src/@domains/orders`, `FE/artium-web/src/@shared/apis`, `BE/apps/api-gateway/src/presentation/http/controllers`, `BE/apps/orders-service/src`, `BE/apps/artwork-service/src`, `BE/libs/common/src/dtos`, `BE/libs/blockchain/src/services`, `BE/libs/outbox/src`  
**Pattern extraction date:** 2026-04-27
