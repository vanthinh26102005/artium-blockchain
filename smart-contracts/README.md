# ArtAuctionEscrow Smart Contract

On-chain escrow for physical art auctions. Holds buyer funds until delivery is confirmed, with timeout and dispute mechanisms to protect both parties.

## Roles

| Role | Description |
|------|-------------|
| **Seller** | Creates auctions, ships art, claims payment |
| **Buyer** | Highest bidder — confirms delivery, opens disputes, claims refunds on timeout |
| **Arbiter** | Resolves disputes (set at deploy, cannot be changed) |
| **Platform** | Receives fee (basis points) on every completed sale |

## States

```
Started → Ended → Shipped → Completed
   ↓         ↓        ↓
Cancelled  Cancelled  Disputed → Completed
                         ↓
                      Cancelled
```

| State | Meaning |
|-------|---------|
| `Started` | Auction is live, accepting bids |
| `Ended` | Auction closed with reserve met — waiting for seller to ship |
| `Shipped` | Seller provided tracking proof — waiting for buyer to confirm |
| `Disputed` | Buyer challenged delivery — waiting for arbiter resolution |
| `Completed` | Funds released to seller (minus platform fee). Terminal state |
| `Cancelled` | Funds returned to buyer via `pendingReturns`. Terminal state |

## State Transitions & Scenarios

### Started

| Action | Who | Next State | Condition |
|--------|-----|------------|-----------|
| `bid()` | Anyone (except seller) | Started | Before `endTime`, must exceed previous bid by `minBidIncrement`. Anti-snipe: extends `endTime` by 10 min if bid arrives within last 10 min |
| `endAuction()` | Seller | **Ended** | After `endTime`, highest bid >= `reservePrice` |
| `endAuction()` | Seller | **Cancelled** | After `endTime`, reserve NOT met (refunds highest bidder) |
| `cancelAuction()` | Seller | **Cancelled** | Only if zero bids placed |

### Ended

| Action | Who | Next State | Condition |
|--------|-----|------------|-----------|
| `markShipped()` | Seller | **Shipped** | Before `shippingDeadline` (5 days). Must provide tracking hash |
| `claimShippingTimeout()` | Anyone | **Cancelled** | After `shippingDeadline`. Refunds buyer |

### Shipped

| Action | Who | Next State | Condition |
|--------|-----|------------|-----------|
| `confirmDelivery()` | Buyer | **Completed** | Anytime. Pays seller (minus fee) |
| `openDispute()` | Buyer | **Disputed** | Before `deliveryDeadline` (14 days) |
| `claimDeliveryTimeout()` | Seller | **Completed** | After `deliveryDeadline`. Pays seller (minus fee) |

### Disputed

| Action | Who | Next State | Condition |
|--------|-----|------------|-----------|
| `resolveDispute(true)` | Arbiter | **Cancelled** | Favor buyer — refunds buyer |
| `resolveDispute(false)` | Arbiter | **Completed** | Favor seller — pays seller (minus fee) |
| `claimDisputeTimeout()` | Buyer | **Cancelled** | After `disputeDeadline` (30 days). Refunds buyer |

## Timeout Windows

| Window | Duration | Starts After |
|--------|----------|-------------|
| Anti-snipe | 10 min extension | Bid within last 10 min of auction |
| Shipping | 5 days | `endAuction()` (reserve met) |
| Delivery | 14 days | `markShipped()` |
| Dispute resolution | 30 days | `openDispute()` |

## Payment Flow

On completion (`confirmDelivery`, `claimDeliveryTimeout`, or `resolveDispute` favoring seller):

```
totalAmount = highestBid
platformFee = totalAmount * platformFeeBps / 10000
sellerPayout = totalAmount - platformFee
```

Platform fee is capped at 10% (`MAX_FEE_BPS = 1000`).

## Fund Recovery

All refunds (outbid, cancelled, dispute won) go to `pendingReturns[address]`. Users call `withdraw()` to pull funds — protected by `ReentrancyGuard`.

## Constructor

```solidity
constructor(address arbiter, address payable platformWallet, uint256 platformFeeBps)
```

All three are immutable after deployment (no setter functions exist).
