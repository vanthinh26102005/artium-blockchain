# Phase 17: Auction Integration - Pattern Map

**Mapped:** 2026-04-24
**Files analyzed:** 18
**Status:** Ready for planning

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `BE/libs/common/src/dtos/auctions/auction-read.dto.ts` | DTO | transform | `BE/libs/common/src/dtos/orders/order.object.ts` | strong |
| `BE/libs/common/src/dtos/auctions/get-auctions.dto.ts` | DTO | request-response | `BE/libs/common/src/dtos/orders/get-orders.dto.ts` | strong |
| `BE/libs/common/src/dtos/auctions/index.ts` | barrel | static | `BE/libs/common/src/dtos/orders/index.ts` | exact |
| `BE/libs/common/src/dtos/index.ts` | barrel | static | existing common DTO barrels | exact |
| `BE/apps/orders-service/src/application/queries/GetAuctions.query.ts` | query | request-response | `BE/apps/orders-service/src/application/queries/GetOrders.query.ts` | strong |
| `BE/apps/orders-service/src/application/queries/GetAuctionById.query.ts` | query | request-response | `BE/apps/orders-service/src/application/queries/GetOrderByOnChainId.query.ts` | strong |
| `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts` | handler | request-response | `BE/apps/orders-service/src/application/queries/handlers/GetOrders.query.handler.ts` | medium |
| `BE/apps/orders-service/src/application/queries/handlers/GetAuctionById.query.handler.ts` | handler | request-response | `BE/apps/orders-service/src/application/queries/handlers/GetOrderByOnChainId.query.handler.ts` | medium |
| `BE/apps/orders-service/src/application/queries/handlers/index.ts` | barrel | static | existing query handler barrel | exact |
| `BE/apps/orders-service/src/application/queries/index.ts` | barrel | static | existing query barrel | exact |
| `BE/apps/orders-service/src/app.module.ts` | module wiring | static | current `QueryHandlers` array | exact |
| `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts` | controller | request-response | existing order query message patterns | strong |
| `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` | controller | request-response | `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` | strong |
| `BE/apps/api-gateway/src/presentation/http/gateways/auction.gateway.ts` | gateway | event-driven | `BE/apps/api-gateway/src/presentation/http/gateways/messaging.gateway.ts` | medium |
| `BE/apps/api-gateway/src/app.module.ts` | module wiring | static | current controller/provider registration | exact |
| `FE/artium-web/src/@shared/apis/auctionApis.ts` | API client | request-response | `FE/artium-web/src/@shared/apis/orderApis.ts` | strong |
| `FE/artium-web/src/@domains/auction/hooks/useAuctionLots.ts` | hook | request-response | `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` async state pattern | medium |
| `FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts` | browser wallet service | event-driven | `FE/artium-web/src/@domains/auth/hooks/useWalletLogin.ts` and checkout wallet transaction code | strong |

## Pattern Assignments

### Backend HTTP/RPC controller pattern

Use `OrdersController` as the primary analog for `AuctionsController`.

Required pattern:

```ts
@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(
    @Inject(MICROSERVICES.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
  ) {}

  @Get()
  async getAuctions(@Query() query: GetAuctionsDto) {
    return sendRpc(this.ordersClient, { cmd: 'get_auctions' }, query)
  }

  @Get(':auctionId')
  async getAuctionById(@Param('auctionId') auctionId: string) {
    return sendRpc(this.ordersClient, { cmd: 'get_auction_by_id' }, { auctionId })
  }
}
```

### Backend query handler pattern

Use `GetOrdersHandler` and `GetOrderByOnChainIdHandler` as the query-handler analogs.

The handler must:

- read order rows by blockchain payment method/on-chain ID
- call `EscrowContractService.getAuction` and `getAuctionTimeline` where on-chain IDs exist
- compute `statusKey`, `statusLabel`, `currentBidEth`, and `minimumNextBidEth`
- embed artwork display data in `artwork`
- return a paginated `{ data, total }` list for `GET /auctions`

### Gateway pattern

Use `MessagingGateway` for basic Socket.IO structure, but do not copy messaging auth semantics directly. Auction rooms are keyed by `auctionId`, and the namespace must be `/auction`.

Required gateway methods:

- `handleConnection`
- `handleDisconnect`
- `handleJoinAuction`
- `handleLeaveAuction`
- `broadcastAuctionStateChanged`

### Frontend API pattern

Use `orderApis.ts` as the API-client analog.

Required pattern:

```ts
import { apiFetch } from '@shared/services/apiClient'

const auctionApis = {
  getAuctions: async (params: GetAuctionsInput): Promise<PaginatedAuctionsResponse> => {
    return apiFetch<PaginatedAuctionsResponse>(`/auctions${buildQueryString(params)}`)
  },
  getAuctionById: async (auctionId: string): Promise<AuctionReadResponse> => {
    return apiFetch<AuctionReadResponse>(`/auctions/${auctionId}`)
  },
}
```

### Frontend page integration pattern

Preserve `LiveAuctionPage.tsx` layout and state names where possible:

- keep `selectedCategory`
- keep `selectedStatus`
- keep `appliedMinPrice`
- keep `appliedMaxPrice`
- keep `currentPage`
- keep `openBidModal` guard for `active` and `ending-soon`

Replace only the data source and state derivation:

- remove the module-level `lots` constant from `mockArtworks`
- use `useAuctionLots` for loading/error/data
- map backend DTOs to existing `AuctionLot` render shape with `auctionLotMapper.ts`
- keep page-level client filtering if backend filtering is incomplete, but still pass filters to `/auctions`

### Wallet transaction pattern

Use wallet-login and checkout wallet code as analogs for provider access and error handling:

- check `window.ethereum`
- request accounts when necessary
- verify `eth_chainId` equals Sepolia `0xaa36a7`
- submit `eth_sendTransaction` with `to` set to the escrow contract and `data` set to encoded `bid(orderId)` calldata
- set `value` to bid amount in wei hex
- return `{ txHash, walletAddress, chainId }`

## Landmines

- Do not permanently mutate listing current bid from local tx submission. Only backend DTO refresh can update card truth.
- Do not fetch artwork separately from the frontend for Phase 17. Auction DTOs must embed artwork fields.
- Do not introduce a new backend microservice. Use `api-gateway`, `orders-service`, existing blockchain library, and existing artwork data sources.
- Do not use mainnet explorer links in UI. Use Sepolia explorer configuration.
- Do not use `Cancel Transaction` copy after wallet handoff; modal dismissal after tx hash is only `Close`.

