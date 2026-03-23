# Artium — Blockchain-Powered Art Auction Platform

> Hybrid Architecture for Physical Art Auctions with On-Chain Escrow
> IE213 Project Presentation

---

## 1. What is Artium?

Artium is an **art auction platform** where sellers list physical artworks, buyers bid using cryptocurrency (ETH), and the entire payment/escrow process is handled by a **smart contract on Ethereum** — removing the need to trust any middleman.

### The Problem We Solve

Traditional art auctions have trust issues:
- Buyer pays but seller never ships
- Seller ships but buyer claims they never received it
- Platform holds funds and can run away with them
- Disputes take weeks with no clear rules

### Our Solution

A **smart contract** acts as an automated, neutral escrow agent:
- Funds are locked in code, not held by any person
- Rules are enforced automatically (ship within 5 days or get refunded)
- Every action is recorded on the blockchain — fully transparent
- A neutral arbiter resolves disputes with clear deadlines

---

## 2. The Three Actors

| Actor | Who are they? | What they do |
|-------|--------------|-------------|
| **Seller** | Artist or gallery owner | Lists artwork for auction, ships the physical piece after sale |
| **Buyer** | Art collector | Bids on artwork using ETH via MetaMask wallet, confirms delivery |
| **Arbiter** | Trusted neutral party | Only acts when there's a dispute — decides who gets the funds |

Additionally, the **Platform (Artium)** collects a small fee (2.5%) on every successful sale.

---

## 3. The Auction State Machine

This is the core of the system. Every auction goes through these states:

```
                              ┌─────────────────────────────────────────────────┐
                              │            HAPPY PATH (normal flow)             │
                              │                                                 │
  ┌──────────┐  endAuction  ┌──────────┐  markShipped  ┌──────────┐  confirm  ┌───────────┐
  │ STARTED  │────────────→ │  ENDED   │──────────────→│ SHIPPED  │─────────→ │ COMPLETED │
  │ Bidding  │              │  Escrow  │               │ Transit  │           │  Paid ✓   │
  └──────────┘              └──────────┘               └──────────┘           └───────────┘
       │                         │                          │
       │ cancel                  │ 5-day                    │ openDispute
       │ (no bids)               │ timeout                  │ (within 14 days)
       ▼                         ▼                          ▼
  ┌───────────┐            ┌───────────┐              ┌──────────┐
  │ CANCELLED │            │ CANCELLED │              │ DISPUTED │
  │ No sale   │            │ Refunded  │              │ Arbiter  │
  └───────────┘            └───────────┘              │ decides  │
                                                      └──────────┘
                                                       │         │
                                                       │         │
                                              favor    │         │  favor
                                              buyer    │         │  seller
                                                       ▼         ▼
                                                 ┌─────────┐ ┌───────────┐
                                                 │CANCELLED│ │ COMPLETED │
                                                 │Refunded │ │  Paid ✓   │
                                                 └─────────┘ └───────────┘
```

**Key insight:** There are only two terminal states — **COMPLETED** (seller gets paid) or **CANCELLED** (buyer gets refunded). Every path leads to one of these.

---

## 4. Happy Path — Step by Step

This is what happens when everything goes well:

### Step 1: Seller Creates Auction

- Seller sets: duration, reserve price, minimum bid increment, IPFS metadata hash
- Smart contract stores auction details on-chain
- Event emitted: `AuctionStarted(orderId, seller, endTime)`
- **State: STARTED**

### Step 2: Buyers Place Bids

- Buyers send ETH to the smart contract via MetaMask
- Each bid must exceed previous bid by `minBidIncrement`
- Previous highest bidder's ETH is moved to `pendingReturns` (they can withdraw later)
- **Anti-snipe protection:** If a bid comes in the last 10 minutes, auction extends by 10 more minutes
- Event emitted: `NewBid(orderId, bidder, amount)`
- **State: remains STARTED**

### Step 3: Auction Ends

- After `endTime` passes, seller calls `endAuction()`
- If highest bid >= reserve price → auction succeeds
- If no bids or below reserve → auction cancelled, all funds returned
- Shipping deadline set: **now + 5 days**
- Event emitted: `AuctionEnded(orderId, winner, amount)`
- **State: ENDED** (funds held in escrow)

### Step 4: Seller Ships the Artwork

- Seller physically ships the art piece
- Calls `markShipped(orderId, trackingHash)` on the smart contract
- `trackingHash` is an IPFS hash containing shipping proof (tracking number, receipt photo)
- Delivery deadline set: **now + 14 days**
- Event emitted: `ArtShipped(orderId, seller, trackingHash)`
- **State: SHIPPED**

### Step 5: Buyer Confirms Delivery

- Buyer receives the artwork, verifies condition
- Calls `confirmDelivery(orderId)` on the smart contract
- Smart contract automatically distributes funds:

```
  Winning Bid: 1 ETH
  ├── Platform Fee (2.5%): 0.025 ETH  →  Platform Wallet
  └── Seller Payout (97.5%): 0.975 ETH  →  Seller Wallet
```

- Event emitted: `DeliveryConfirmed(orderId, winner)`
- **State: COMPLETED** — Transaction finished successfully

---

## 5. Unhappy Path #1 — Dispute Flow

What happens when the buyer is not satisfied:

### Scenario: Art arrives damaged, wrong item, or counterfeit

```
Step 1: Buyer opens dispute
         ↓
   Buyer calls openDispute(orderId, "Art arrived damaged")
   State → DISPUTED
   Dispute deadline: now + 30 days
         ↓
Step 2: Arbiter investigates
         ↓
   Arbiter reviews evidence from both parties (off-chain)
   Then calls resolveDispute(orderId, favorBuyer)
         ↓
   ┌─────────────────────┬──────────────────────┐
   │  favorBuyer = true  │  favorBuyer = false   │
   ├─────────────────────┼──────────────────────┤
   │  Buyer gets refund  │  Seller gets paid     │
   │  State → CANCELLED  │  State → COMPLETED    │
   │  Order → REFUNDED   │  Order → DELIVERED    │
   └─────────────────────┴──────────────────────┘
```

### What if the arbiter doesn't act?

If 30 days pass without resolution, the **buyer** can call `claimDisputeTimeout()` → automatic full refund. This prevents funds from being stuck indefinitely.

---

## 6. Unhappy Path #2 — Timeout Protection

The system has built-in deadlines to protect both parties:

### Shipping Timeout (Protects Buyer)

```
Auction ends → Seller has 5 DAYS to ship
                    ↓
            Did seller ship?
           /                \
         YES                 NO
          ↓                   ↓
     Normal flow     Buyer calls claimShippingTimeout()
                              ↓
                     Full refund to buyer
                     State → CANCELLED
```

**Why?** Prevents seller from winning an auction and never shipping.

### Delivery Timeout (Protects Seller)

```
Seller ships → Buyer has 14 DAYS to confirm or dispute
                    ↓
            Did buyer respond?
           /                \
         YES                 NO
          ↓                   ↓
   Confirm or Dispute  Seller calls claimDeliveryTimeout()
                              ↓
                     Seller gets paid automatically
                     State → COMPLETED
```

**Why?** Prevents buyer from receiving art and never confirming (keeping funds locked).

### Summary of All Timeouts

| Timeout | Window | If Deadline Passes | Who Benefits |
|---------|--------|-------------------|-------------|
| Shipping | 5 days after auction end | Buyer claims refund | **Buyer** protected |
| Delivery | 14 days after shipment | Seller claims payment | **Seller** protected |
| Dispute | 30 days after dispute opened | Buyer claims refund | **Buyer** protected |

---

## 7. Anti-Snipe Mechanism

### The Problem
In online auctions, "sniping" means placing a bid in the very last second, giving no one time to respond. This is unfair.

### Our Solution
```
Normal bid (> 10 min before end):
  → No change to endTime

Late bid (within last 10 minutes):
  → endTime extended by 10 more minutes
  → Event: AuctionExtended(orderId, newEndTime)
```

This ensures all bidders have a fair chance to respond to late bids, similar to how a physical auctioneer would say "Going once... going twice..."

---

## 8. Fee Structure

### How the Platform Makes Money

When an auction completes successfully (buyer confirms delivery OR delivery timeout):

```
┌─────────────────────────────────────────────┐
│           Winning Bid (in Escrow)            │
│                                             │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Platform Fee  │  │   Seller Payout     │  │
│  │              │  │                     │  │
│  │  2.5%        │  │   97.5%             │  │
│  │ (250 bps)    │  │                     │  │
│  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────┘
        ↓                      ↓
  Platform Wallet        Seller Wallet
  (automatic transfer)  (automatic transfer)
```

- Fee rate is set at contract deployment (immutable — can't be changed later)
- Maximum allowed: 10% (1000 basis points)
- Calculated and transferred **on-chain** — fully transparent and verifiable
- Fee is only charged on **successful** transactions (not on cancellations or refunds)

---

## 9. How On-Chain Meets Off-Chain (Hybrid Architecture)

### The Challenge
Smart contracts are great for trustless payments, but they can't:
- Send email notifications
- Show order history in a web UI
- Store detailed shipping addresses
- Provide search and filtering

### Our Solution: Event Bridge Architecture

```
┌─────────────┐                    ┌──────────────────┐
│   Browser    │ ── MetaMask tx ──→│  Smart Contract   │
│  (Frontend)  │                    │  (Ethereum)       │
└─────────────┘                    └────────┬──────────┘
                                            │ emits events
                                   ┌────────▼──────────┐
                                   │  Event Listener    │
                                   │  (NestJS service)  │
                                   └────────┬──────────┘
                                            │ saves to outbox
                                   ┌────────▼──────────┐
                                   │  Outbox Table      │
                                   │  (PostgreSQL)      │
                                   └────────┬──────────┘
                                            │ publishes (every 5s)
                                   ┌────────▼──────────┐
                                   │    RabbitMQ        │
                                   │  (Message Broker)  │
                                   └────────┬──────────┘
                                            │ consumes
                                   ┌────────▼──────────┐
                                   │  Orders Service    │
                                   │  (Creates/updates  │
                                   │   order records)   │
                                   └───────────────────┘
```

### Why the Outbox Pattern?

**Problem:** What if the server crashes right after receiving a blockchain event but before publishing to RabbitMQ? The event is lost forever.

**Solution:** The Outbox Pattern:
1. Event listener writes the event to a database table (atomic, reliable)
2. A background job (every 5 seconds) reads unpublished events and sends them to RabbitMQ
3. Even if the server crashes, events are safely in the database and will be published on restart
4. Guarantees **at-least-once delivery** — no event is ever lost

---

## 10. Complete Order Lifecycle Mapping

This table shows how the on-chain state maps to the off-chain order in our database:

| Phase | Smart Contract State | Order Status | Payment Status | What's Happening |
|-------|---------------------|-------------|----------------|-----------------|
| Bidding | `STARTED` | `AUCTION_ACTIVE` | `UNPAID` | Buyers are bidding with ETH |
| Auction won | `ENDED` | `ESCROW_HELD` | `ESCROW` | Winner decided, funds locked in contract |
| Art shipped | `SHIPPED` | `SHIPPED` | `ESCROW` | Seller shipped, waiting for confirmation |
| Delivery OK | `COMPLETED` | `DELIVERED` | `RELEASED` | Buyer confirmed, seller paid |
| Dispute filed | `DISPUTED` | `DISPUTE_OPEN` | `ESCROW` | Buyer unhappy, arbiter investigating |
| Buyer wins dispute | `CANCELLED` | `REFUNDED` | `REFUNDED` | Buyer gets full refund |
| Seller wins dispute | `COMPLETED` | `DELIVERED` | `RELEASED` | Seller gets paid |
| Timeout/cancel | `CANCELLED` | `CANCELLED` | `REFUNDED` | Funds returned to buyer |

### Why Two State Systems?

- **EscrowState** (on-chain): Tracks the smart contract state — controls money flow
- **OrderStatus** (off-chain): Tracks the business state — shown in the UI, used for notifications, reports

They are synchronized via blockchain events → RabbitMQ → Orders Service.

---

## 11. Security & Trust Guarantees

| Guarantee | How We Achieve It |
|-----------|-------------------|
| **Funds can't be stolen** | ETH held by smart contract code, not any person or company |
| **Seller must ship on time** | 5-day shipping deadline enforced by contract, auto-refund if missed |
| **Buyer can't stall forever** | 14-day delivery deadline, auto-release to seller if no response |
| **Arbiter can't stall** | 30-day dispute deadline, auto-refund to buyer if no resolution |
| **No double-spending** | Ethereum blockchain consensus prevents duplicate transactions |
| **No reentrancy attacks** | OpenZeppelin `ReentrancyGuard` on all fund-transfer functions |
| **Fair bidding** | Anti-snipe mechanism extends auction on late bids |
| **Event reliability** | Outbox pattern ensures no blockchain events are lost |
| **Transparent fees** | Fee calculated and transferred on-chain, publicly verifiable |

---

## 12. Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Smart Contract | Solidity 0.8.20 | Escrow logic, bidding, fund management |
| Security | OpenZeppelin Contracts v5 | ReentrancyGuard for safe transfers |
| Blockchain | Ethereum (Sepolia testnet) | Decentralized ledger for transactions |
| Wallet Integration | MetaMask + ethers.js v6 | User signs transactions in browser |
| Backend Framework | NestJS (10 microservices) | API, business logic, notifications |
| Architecture Pattern | DDD + CQRS + Event-Driven | Clean separation of concerns |
| Message Broker | RabbitMQ (topic exchanges) | Async communication between services |
| Database | PostgreSQL (per-service) | Order storage, user data, etc. |
| Event Reliability | Outbox Pattern | Guaranteed event delivery |
| Contract Testing | Hardhat + Chai | Automated smart contract tests |
| API Gateway | NestJS Gateway | REST API aggregation for frontend |

---

## 13. What Makes This Project Unique

### Hybrid Architecture
Unlike purely on-chain NFT marketplaces, we handle **physical art delivery** — requiring a bridge between blockchain (trustless payments) and traditional e-commerce (shipping, tracking, notifications).

### Comprehensive Timeout System
Every state has an exit path with specific deadlines. No funds can ever be permanently locked, regardless of any party becoming unresponsive.

### Event-Driven Synchronization
The Outbox Pattern ensures our off-chain database stays perfectly synchronized with on-chain state — even through server crashes and network failures.

### Real Escrow for Physical Goods
The smart contract holds funds until physical delivery is confirmed — solving the core trust problem in online art sales where items cost thousands of dollars.

---

## Appendix A: Complete Event Flow Reference

| Smart Contract Event | RabbitMQ Routing Key | Orders Service Action |
|---------------------|---------------------|----------------------|
| `AuctionStarted` | `blockchain.auction.started` | (UI notification only) |
| `NewBid` | `blockchain.bid.new` | (UI notification only) |
| `AuctionEnded` | `blockchain.auction.ended` | **Create order** (ESCROW_HELD) |
| `ArtShipped` | `blockchain.auction.shipped` | **Update order** → SHIPPED |
| `DeliveryConfirmed` | `blockchain.auction.delivery_confirmed` | **Update order** → DELIVERED |
| `DisputeOpened` | `blockchain.dispute.opened` | **Update order** → DISPUTE_OPEN |
| `DisputeResolved` | `blockchain.dispute.resolved` | **Update order** → REFUNDED or DELIVERED |
| `AuctionCancelled` | `blockchain.auction.cancelled` | **Update order** → CANCELLED |
| `ShippingTimeout` | `blockchain.auction.shipping_timeout` | (Notification only) |
| `DeliveryTimeout` | `blockchain.auction.delivery_timeout` | (Notification only) |
| `AuctionExtended` | `blockchain.auction.extended` | (UI update only) |
| `Withdrawn` | `blockchain.funds.withdrawn` | (Notification only) |

---

## Appendix B: Canva Slide Mapping

| Slide # | Title | Key Visual |
|---------|-------|-----------|
| 1 | Title Slide | Project name + tagline |
| 2 | The Problem | Trust issues in art auctions (icons) |
| 3 | Our Solution | Smart contract as neutral escrow (diagram) |
| 4 | The Three Actors | Seller, Buyer, Arbiter icons with roles |
| 5 | State Machine | Flowchart from Section 3 |
| 6 | Happy Path | 5-step timeline from Section 4 |
| 7 | Dispute Flow | Decision tree from Section 5 |
| 8 | Timeout Protection | Table from Section 6 |
| 9 | Anti-Snipe | Before/after comparison from Section 7 |
| 10 | Fee Structure | Pie chart from Section 8 |
| 11 | Hybrid Architecture | Architecture diagram from Section 9 |
| 12 | Order Lifecycle | Table from Section 10 |
| 13 | Security Guarantees | Checklist from Section 11 |
| 14 | Tech Stack | Logo grid from Section 12 |
| 15 | What Makes Us Unique | Bullet points from Section 13 |
| 16 | Q&A | Thank you + questions |
