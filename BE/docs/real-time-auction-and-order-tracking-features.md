# Real-Time Auction System, Order Tracking & Arbiter Phase

Feature specification and UX design for Artium's blockchain-backed auction platform.

---

## Table of Contents

1. [System Context](#1-system-context)
2. [Real-Time Auction Room](#2-real-time-auction-room)
3. [Order Tracking System](#3-order-tracking-system)
4. [Arbiter / Dispute Resolution Phase](#4-arbiter--dispute-resolution-phase)
5. [Notification Strategy](#5-notification-strategy)
6. [Screen-by-Screen UX Layout](#6-screen-by-screen-ux-layout)
7. [Technical Alignment with Backend](#7-technical-alignment-with-backend)

---

## 1. System Context

### Existing Backend Capabilities

| Capability | Status | Source |
|---|---|---|
| Smart contract state machine (Started, Ended, Shipped, Disputed, Completed, Cancelled) | Implemented | `ArtAuctionEscrow.sol` |
| On-chain event listener publishing to RabbitMQ via Outbox | Implemented | `BlockchainEventListenerService` |
| Order creation from `AuctionEnded` event | Implemented | `BlockchainEventHandler` |
| Order status sync from blockchain events (shipped, delivered, disputed, resolved, cancelled) | Implemented | `BlockchainEventHandler` |
| WebSocket infr∫astructure (Socket.IO) | Implemented | `MessagingGateway` (api-gateway) |
| Notification history with channels (EMAIL, PUSH, IN_APP) | Implemented | `NotificationHistory` entity |
| `EscrowContractService` for reading on-chain state | Implemented | `libs/blockchain` |
| Shopping cart entities | Scaffolded | `ShoppingCart`, `CartItem` entities |
| Auction-specific API endpoints | NOT implemented | Needs new controllers/commands |
| Real-time bid broadcasting | NOT implemented | Needs new WebSocket gateway |
| Dispute UI flow and arbiter dashboard | NOT implemented | Needs full feature build |

### On-Chain State Machine (Reference)

```
Started --> Ended --> Shipped --> Completed
   |           |         |
   v           v         v
Cancelled  Cancelled  Disputed --> Completed
                          |
                          v
                       Cancelled
```

**Timeout windows:** Anti-snipe 10 min | Shipping 5 days | Delivery 14 days | Dispute 30 days

---

## 2. Real-Time Auction Room

### 2.1 Features Required

#### A. Auction Discovery & Browsing

| Feature | Description | Priority |
|---|---|---|
| **Live Auctions Feed** | Grid/list of active auctions with countdown timers, current bid, artwork thumbnail | P0 |
| **Upcoming Auctions** | Scheduled auctions users can set reminders for | P1 |
| **Ending Soon** | Filtered view of auctions ending within 1 hour, sorted by urgency | P0 |
| **Search & Filter** | Filter by medium, price range, artist, time remaining | P1 |
| **Auction Calendar** | Calendar view showing when auctions start/end | P2 |

#### B. Auction Room (Single Auction Page)

| Feature | Description | Priority |
|---|---|---|
| **Artwork Hero Section** | High-resolution zoomable image gallery, IPFS provenance badge | P0 |
| **Artwork Details Panel** | Title, artist, dimensions, materials, creation year, description, condition report | P0 |
| **Live Bid Feed** | Real-time scrolling list of bids (bidder avatar, amount, timestamp) | P0 |
| **Current Bid Display** | Large, prominent display of current highest bid with ETH and USD equivalent | P0 |
| **Countdown Timer** | Animated countdown with visual urgency change at <5 min (anti-snipe zone) | P0 |
| **Bid Input** | Input field pre-filled with minimum valid bid, one-tap bid button, wallet balance shown | P0 |
| **Quick Bid Buttons** | Predefined increment buttons (min increment, 2x, 5x, custom) | P1 |
| **Reserve Price Indicator** | "Reserve met" / "Reserve not yet met" badge (without revealing the price) | P0 |
| **Bid Confirmation Modal** | Review bid amount, gas estimate, wallet confirmation step | P0 |
| **Anti-Snipe Notification** | Visual + audio alert when auction is extended due to late bid | P0 |
| **Participant Count** | Number of unique bidders and watchers currently in the room | P1 |
| **Bid History Tab** | Tabular view of all bids with on-chain tx links | P1 |
| **Share & Watch** | Share auction link, add to watchlist for notifications | P1 |
| **Seller Profile Card** | Seller avatar, name, verification badge, rating, past sales count | P1 |

#### C. Bidder Experience

| Feature | Description | Priority |
|---|---|---|
| **Wallet Connection** | Connect wallet prompt for unauthenticated users, balance display | P0 |
| **Outbid Alert** | Push notification + in-room toast when outbid | P0 |
| **Auto-Bid (Proxy Bidding)** | Set a maximum bid; system auto-bids minimum increments up to that ceiling | P2 |
| **Bid Withdrawal** | Claim pending returns from outbid amounts via `withdraw()` | P0 |
| **My Active Bids** | Dashboard showing all auctions where user is currently highest bidder or has pending returns | P1 |

#### D. Seller Experience

| Feature | Description | Priority |
|---|---|---|
| **Create Auction Form** | Set duration, reserve price, min bid increment, upload artwork images, IPFS metadata | P0 |
| **Auction Management** | View active auctions, see bid activity, cancel (if no bids) | P0 |
| **End Auction Action** | Button available after `endTime` passes to finalize on-chain | P0 |
| **Auction Analytics** | Views, unique visitors, bid count, bid velocity over time | P2 |

### 2.2 Real-Time Data Flow

```
[Blockchain Event]
    |
    v
BlockchainEventListenerService (listens to contract events)
    |
    v
OutboxService --> RabbitMQ (blockchain.events.exchange)
    |                         |
    v                         v
orders-service           api-gateway (new subscriber)
(order sync)                  |
                              v
                     AuctionWebSocketGateway
                              |
                              v
                    Socket.IO broadcast to room
                              |
                              v
                     [All connected clients]
```

**WebSocket Events (new `auction` namespace):**

| Event | Direction | Payload |
|---|---|---|
| `joinAuction` | Client -> Server | `{ auctionId }` |
| `leaveAuction` | Client -> Server | `{ auctionId }` |
| `newBid` | Server -> Room | `{ auctionId, bidder, amount, timestamp }` |
| `auctionExtended` | Server -> Room | `{ auctionId, newEndTime }` |
| `auctionEnded` | Server -> Room | `{ auctionId, winner, amount }` |
| `auctionCancelled` | Server -> Room | `{ auctionId, reason }` |
| `participantUpdate` | Server -> Room | `{ auctionId, watcherCount, bidderCount }` |
| `outbid` | Server -> User | `{ auctionId, newHighestBid }` |

### 2.3 UX Interaction Design

**Auction Room Layout (Desktop):**

```
+------------------------------------------------------------------+
|  [< Back to Auctions]              [Share] [Watch] [Wallet: 2.5E] |
+------------------------------------------------------------------+
|                            |                                      |
|   +------------------+    |   ARTWORK TITLE                      |
|   |                  |    |   by Artist Name [Verified]           |
|   |   ARTWORK IMAGE  |    |                                      |
|   |   (zoomable)     |    |   Current Bid                        |
|   |                  |    |   +--------------------------+        |
|   |                  |    |   | 1.25 ETH  (~$2,340)     |        |
|   +------------------+    |   +--------------------------+        |
|   [img] [img] [img]      |                                      |
|                           |   [Reserve Met]                      |
|                           |                                      |
|                           |   Time Remaining                     |
|                           |   02:34:17                           |
|                           |   ========== progress bar            |
|                           |                                      |
|                           |   Place Bid                          |
|                           |   +----------+ [+0.05] [+0.1] [+0.5]|
|                           |   | 1.30 ETH | [PLACE BID]          |
|                           |   +----------+                       |
|                           |                                      |
+---------------------------+--------------------------------------+
|  [Details] [Bid History] [Provenance]                            |
+------------------------------------------------------------------+
|  Live Bid Feed                          Seller Info              |
|  +---------------------------+    +---------------------+        |
|  | 0x3f..a2  1.25 ETH 2m    |    | @artgallery_nyc     |        |
|  | 0xc1..b7  1.20 ETH 5m    |    | 47 sales | 4.8 star |        |
|  | 0x3f..a2  1.15 ETH 8m    |    | Member since 2024   |        |
|  | 0xd4..91  1.10 ETH 12m   |    +---------------------+        |
|  +---------------------------+                                   |
+------------------------------------------------------------------+
```

**Mobile Layout:** Single-column stack. Artwork image full-width at top, sticky bid bar at bottom with current bid + timer + bid button. Bid feed in a collapsible drawer that slides up.

**Key Interaction Patterns:**

1. **Bidding flow:** Tap "Place Bid" -> Bid confirmation modal (shows bid amount, gas estimate, your balance after) -> Wallet signature popup -> Success toast with confetti animation -> Bid appears in live feed
2. **Outbid recovery:** Toast notification "You've been outbid! Current bid: 1.30 ETH" with inline "Bid Again" button -> Pre-fills next minimum bid
3. **Anti-snipe visual:** When timer < 10 min, the timer turns amber. When a late bid extends time, a pulse animation plays with text "+10 min added" and an optional sound effect
4. **Auction ending:** Countdown reaches zero -> "Auction Ending..." overlay -> Result announced ("Sold to 0x3f...a2 for 1.25 ETH" or "Reserve not met - Auction cancelled") -> CTA changes to order tracking or "Browse more"

---

## 3. Order Tracking System

### 3.1 Features Required

#### A. Order Dashboard (Buyer)

| Feature | Description | Priority |
|---|---|---|
| **Order List** | All orders with status badges, artwork thumbnails, dates, amounts | P0 |
| **Filter by Status** | Tabs: All / Active / Shipped / Completed / Disputed / Cancelled | P0 |
| **Order Card** | Compact card showing artwork image, title, status badge, amount, key date | P0 |
| **Sort Options** | By date, by amount, by status | P1 |

#### B. Order Detail Page

| Feature | Description | Priority |
|---|---|---|
| **Order Status Timeline** | Vertical stepper showing all lifecycle states with timestamps | P0 |
| **Current Step Highlight** | Active step visually prominent with pulsing indicator | P0 |
| **Artwork Summary** | Image, title, artist, final bid amount, on-chain order ID | P0 |
| **Escrow Status Card** | Shows funds held in escrow, contract address, tx hash link to Etherscan | P0 |
| **Shipping Information** | Carrier, tracking number (from `trackingHash`), estimated delivery | P0 |
| **Tracking Map/Progress** | Visual progress indicator (shipped -> in transit -> out for delivery -> delivered) | P1 |
| **Deadline Indicators** | Shipping deadline, delivery deadline with countdown + "what happens if missed" tooltip | P0 |
| **Action Buttons** | Context-sensitive: "Confirm Delivery", "Open Dispute", "Claim Refund (timeout)" | P0 |
| **On-Chain Proof** | Link to each state-transition tx on Etherscan/block explorer | P1 |
| **Communication** | In-context messaging with seller (links to messaging service) | P1 |

#### C. Order Detail Page (Seller)

| Feature | Description | Priority |
|---|---|---|
| **Order Status Timeline** | Same as buyer view but with seller-specific actions | P0 |
| **Ship Order Action** | "Mark as Shipped" button -> form for tracking hash/proof -> on-chain `markShipped()` | P0 |
| **Shipping Deadline Countdown** | Prominent countdown showing time left to ship (5-day window) | P0 |
| **Payout Status** | Shows pending/released payout amount, platform fee breakdown | P0 |
| **Buyer Info** | Shipping address (from order), buyer wallet address | P0 |

#### D. Status Transition Actions (Mapped to Smart Contract)

| Order Status | Available Actions (Buyer) | Available Actions (Seller) |
|---|---|---|
| `ESCROW_HELD` (Ended) | Wait for shipment | "Mark as Shipped" (within 5 days) |
| `SHIPPED` | "Confirm Delivery" or "Open Dispute" (within 14 days) | Wait for confirmation |
| `DISPUTE_OPEN` | Wait for arbiter | Wait for arbiter |
| `DELIVERED` (Completed) | Leave review | View payout details |
| `CANCELLED` | "Withdraw Funds" (if pending returns > 0) | -- |
| `REFUNDED` | "Withdraw Funds" | -- |

### 3.2 Order Status Timeline UX

```
+------------------------------------------------------------------+
|  Order #AUC-1711612345-X3K2HF                                    |
|  Artwork: "Sunset over Manhattan" by @artgallery_nyc             |
+------------------------------------------------------------------+
|                                                                  |
|  Status Timeline                                                 |
|                                                                  |
|  [*] Auction Won                        Mar 28, 2026 12:30 PM   |
|   |  You won with a bid of 1.25 ETH                             |
|   |  tx: 0xabc...def (link)                                     |
|   |                                                              |
|  [*] Escrow Held                        Mar 28, 2026 12:30 PM   |
|   |  1.25 ETH held in escrow contract                           |
|   |  Contract: 0x123...789 (link)                                |
|   |                                                              |
|  [*] Shipped                            Mar 29, 2026 3:15 PM    |
|   |  Tracking: QR2X-7892-HASH                                   |
|   |  tx: 0xdef...123 (link)                                     |
|   |                                                              |
|  [o] Awaiting Delivery Confirmation     <-- YOU ARE HERE         |
|   |  Delivery deadline: Apr 12, 2026                             |
|   |  13 days 8 hours remaining                                   |
|   |                                                              |
|   |  +---------------------------+  +-------------------+        |
|   |  | Confirm Delivery          |  | Open Dispute      |        |
|   |  +---------------------------+  +-------------------+        |
|   |                                                              |
|  [ ] Completed                                                   |
|      Funds released to seller                                    |
|                                                                  |
+------------------------------------------------------------------+
|  Escrow Details                                                  |
|  +-------------------------------+                               |
|  | Amount:    1.25 ETH           |                               |
|  | Platform:  2.5% (0.03125 ETH) |                               |
|  | Seller:    1.21875 ETH        |                               |
|  | Contract:  0x123...789        |                               |
|  | State:     Shipped (on-chain) |                               |
|  +-------------------------------+                               |
+------------------------------------------------------------------+
```

**Mobile adaptation:** Timeline becomes a horizontal scrollable stepper at the top with the active step expanded below. Action buttons become a sticky bottom bar.

### 3.3 Real-Time Order Updates

Orders update in real-time via the same blockchain event -> RabbitMQ -> WebSocket pipeline:

| Event | UI Update |
|---|---|
| `ArtShipped` | Timeline advances to "Shipped", tracking info appears, delivery countdown starts |
| `DeliveryConfirmed` | Timeline advances to "Completed", confetti animation, payout info shown |
| `DisputeOpened` | Timeline branches to "Disputed", arbiter information shown |
| `DisputeResolved` | Timeline resolves to "Completed" or "Cancelled/Refunded" with explanation |
| `ShippingTimeout` | "Shipping deadline passed" alert, "Claim Refund" button activates |
| `DeliveryTimeout` | Seller-side: auto-completion notification |
| `AuctionCancelled` | Status changes to cancelled with reason, refund instructions shown |

---

## 4. Arbiter / Dispute Resolution Phase

### 4.1 Features Required

#### A. Buyer Dispute Flow

| Feature | Description | Priority |
|---|---|---|
| **Open Dispute Button** | Available on shipped orders before delivery deadline | P0 |
| **Dispute Reason Form** | Structured categories (not received, damaged, not as described, counterfeit) + free text | P0 |
| **Evidence Upload** | Photo/video upload for condition evidence, stored on IPFS | P0 |
| **Dispute Confirmation** | Review screen showing dispute details before on-chain submission | P0 |
| **Dispute Status Tracker** | Shows dispute state, arbiter assignment, resolution deadline (30 days) | P0 |
| **Communication Thread** | Buyer-seller-arbiter threaded messages within dispute context | P1 |

#### B. Dispute Resolution (Arbiter Dashboard)

| Feature | Description | Priority |
|---|---|---|
| **Dispute Queue** | List of open disputes sorted by deadline urgency | P0 |
| **Dispute Detail View** | Full context: auction details, bid history, shipping proof, buyer evidence, message thread | P0 |
| **Evidence Review Panel** | Side-by-side comparison: original artwork listing vs buyer-submitted photos | P0 |
| **On-Chain History** | Full transaction history for this order from block explorer | P1 |
| **Resolution Actions** | "Favor Buyer (Refund)" / "Favor Seller (Release Funds)" with required reasoning | P0 |
| **Resolution Confirmation** | Review decision before on-chain execution with impact preview | P0 |
| **Resolution History** | Past resolved disputes for reference and consistency | P1 |

#### C. Dispute Timeout Protection

| Feature | Description | Priority |
|---|---|---|
| **Deadline Countdown** | 30-day dispute resolution window countdown visible to all parties | P0 |
| **Escalation Warnings** | At 7 days, 3 days, 1 day remaining: notifications to arbiter | P0 |
| **Auto-Refund Trigger** | After 30 days, buyer can call `claimDisputeTimeout()` and UI shows "Claim Refund" button | P0 |
| **Timeout Explanation** | Clear messaging explaining what happens if arbiter does not resolve in time | P0 |

### 4.2 Dispute Flow UX

**Opening a Dispute:**

```
+------------------------------------------------------------------+
|  Open Dispute for Order #AUC-1711612345-X3K2HF                   |
+------------------------------------------------------------------+
|                                                                  |
|  What is the issue?                                              |
|                                                                  |
|  ( ) Item not received                                           |
|  (*) Item significantly not as described                         |
|  ( ) Item arrived damaged                                        |
|  ( ) Suspected counterfeit / authenticity concern                |
|                                                                  |
|  Describe the issue:                                             |
|  +------------------------------------------------------+       |
|  | The painting dimensions are 20x30cm but the listing  |       |
|  | stated 50x70cm. Color is also significantly different |       |
|  | from the photos.                                      |       |
|  +------------------------------------------------------+       |
|                                                                  |
|  Upload Evidence:                                                |
|  [+ Add Photos]  [+ Add Video]                                   |
|  +--------+ +--------+ +--------+                                |
|  | photo1 | | photo2 | | photo3 |                                |
|  +--------+ +--------+ +--------+                                |
|                                                                  |
|  +---------------------------------------------------------+     |
|  | This will submit a dispute on the blockchain.            |     |
|  | The arbiter has 30 days to review and resolve.           |     |
|  | If unresolved after 30 days, you may claim a full refund.|     |
|  | Gas fee estimate: ~0.002 ETH                             |     |
|  +---------------------------------------------------------+     |
|                                                                  |
|  [Cancel]                             [Submit Dispute On-Chain]  |
+------------------------------------------------------------------+
```

**Arbiter Review Panel:**

```
+------------------------------------------------------------------+
|  Dispute: Order #AUC-1711612345-X3K2HF          [30d 0h 0m left] |
+------------------------------------------------------------------+
|  LEFT PANEL                     |  RIGHT PANEL                    |
|                                 |                                 |
|  Original Listing               |  Buyer Evidence                 |
|  +-------------------+         |  +-------------------+          |
|  |                   |         |  |                   |          |
|  |  Listing Photo    |         |  |  Received Photo   |          |
|  |  50x70cm stated   |         |  |  20x30cm actual   |          |
|  |                   |         |  |                   |          |
|  +-------------------+         |  +-------------------+          |
|                                 |                                 |
|  Seller: @artgallery_nyc       |  Buyer: 0x3f..a2               |
|  IPFS Hash: Qm...abc           |  Dispute reason:               |
|  Auction final bid: 1.25 ETH   |  "Dimensions mismatch..."      |
|  Shipped: Mar 29               |  Filed: Apr 5                  |
|                                 |                                 |
+---------------------------------+---------------------------------+
|  Communication Thread                                            |
|  +--------------------------------------------------------------+|
|  | [Buyer] Apr 5: The dimensions don't match at all...          ||
|  | [Seller] Apr 6: The listing clearly states approximate...    ||
|  | [Arbiter] Apr 7: Can the seller provide measurement proof?   ||
|  +--------------------------------------------------------------+|
|                                                                  |
|  Resolution                                                      |
|  Reason: ____________________________________________            |
|                                                                  |
|  [Favor Buyer - Refund 1.25 ETH]  [Favor Seller - Release Funds]|
+------------------------------------------------------------------+
```

### 4.3 Dispute State Indicators

| State | Buyer Sees | Seller Sees | Arbiter Sees |
|---|---|---|---|
| Dispute filed | "Under Review - awaiting arbiter" | "Dispute filed - respond with evidence" | New item in queue |
| Under review | "Arbiter is reviewing" + countdown | "Arbiter is reviewing" + countdown | Evidence panels + resolve buttons |
| Resolved (favor buyer) | "Dispute resolved in your favor. Claim refund." | "Dispute resolved. Buyer refunded." | Completed - logged |
| Resolved (favor seller) | "Dispute resolved. Funds released to seller." | "Dispute resolved in your favor. Payout incoming." | Completed - logged |
| Timed out | "Arbiter did not resolve in time. Claim refund." | "Dispute timed out. Buyer refunded." | Overdue warning |

---

## 5. Notification Strategy

### 5.1 Auction Notifications

| Event | Channel | Recipient | Message |
|---|---|---|---|
| New bid on watched auction | IN_APP, PUSH | Watchers | "New bid of X ETH on [Artwork]" |
| Outbid | IN_APP, PUSH, EMAIL | Previous highest bidder | "You've been outbid on [Artwork]. Current bid: X ETH" |
| Auction ending soon (15 min) | IN_APP, PUSH | Watchers + bidders | "[Artwork] auction ends in 15 minutes" |
| Anti-snipe extension | IN_APP | Room participants | "Auction extended by 10 minutes" |
| Auction won | IN_APP, PUSH, EMAIL | Winner | "Congratulations! You won [Artwork] for X ETH" |
| Auction ended (reserve not met) | IN_APP, EMAIL | All bidders | "[Artwork] auction ended - reserve not met" |

### 5.2 Order Notifications

| Event | Channel | Recipient | Message |
|---|---|---|---|
| Order created | IN_APP, EMAIL | Buyer | "Order #[number] created for [Artwork]" |
| Item shipped | IN_APP, PUSH, EMAIL | Buyer | "[Artwork] has been shipped. Track your order." |
| Shipping deadline approaching (1 day) | IN_APP, PUSH, EMAIL | Seller | "Ship [Artwork] within 24 hours or buyer can claim refund" |
| Shipping deadline passed | IN_APP, PUSH, EMAIL | Buyer + Seller | "Shipping deadline passed. Buyer may claim refund." |
| Delivery confirmed | IN_APP, EMAIL | Seller | "Buyer confirmed delivery of [Artwork]. Payout initiated." |
| Delivery deadline approaching (2 days) | IN_APP, PUSH | Buyer | "Confirm delivery or open dispute within 2 days" |

### 5.3 Dispute Notifications

| Event | Channel | Recipient | Message |
|---|---|---|---|
| Dispute opened | IN_APP, EMAIL | Seller + Arbiter | "Dispute filed on order #[number]" |
| New dispute message | IN_APP, PUSH | All parties | "New message in dispute for [Artwork]" |
| Dispute deadline warning (7d, 3d, 1d) | IN_APP, PUSH, EMAIL | Arbiter | "Dispute deadline in [X] days" |
| Dispute resolved | IN_APP, PUSH, EMAIL | Buyer + Seller | "Dispute resolved [in your favor / against you]" |
| Dispute timed out | IN_APP, PUSH, EMAIL | Buyer + Seller + Arbiter | "Dispute resolution timed out" |

### 5.4 New NotificationTriggerEvents Needed

```typescript
// Add to NotificationTriggerEvent enum
AUCTION_BID_OUTBID = 'AUCTION_BID_OUTBID',
AUCTION_ENDING_SOON = 'AUCTION_ENDING_SOON',
AUCTION_WON = 'AUCTION_WON',
AUCTION_LOST = 'AUCTION_LOST',
AUCTION_RESERVE_NOT_MET = 'AUCTION_RESERVE_NOT_MET',
ORDER_SHIPPING_DEADLINE_WARNING = 'ORDER_SHIPPING_DEADLINE_WARNING',
ORDER_SHIPPING_TIMEOUT = 'ORDER_SHIPPING_TIMEOUT',
ORDER_DELIVERY_DEADLINE_WARNING = 'ORDER_DELIVERY_DEADLINE_WARNING',
ORDER_DELIVERY_CONFIRMED = 'ORDER_DELIVERY_CONFIRMED',
DISPUTE_OPENED = 'DISPUTE_OPENED',
DISPUTE_MESSAGE_NEW = 'DISPUTE_MESSAGE_NEW',
DISPUTE_DEADLINE_WARNING = 'DISPUTE_DEADLINE_WARNING',
DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
DISPUTE_TIMED_OUT = 'DISPUTE_TIMED_OUT',
FUNDS_AVAILABLE_WITHDRAW = 'FUNDS_AVAILABLE_WITHDRAW',
```

---

## 6. Screen-by-Screen UX Layout

### 6.1 Navigation Architecture

```
Home
 |
 +-- Auctions
 |    +-- Live Auctions (grid)
 |    +-- Ending Soon
 |    +-- Upcoming
 |    +-- Auction Room (single auction)
 |
 +-- My Bids
 |    +-- Active Bids
 |    +-- Won
 |    +-- Outbid / Lost
 |    +-- Pending Withdrawals
 |
 +-- Orders
 |    +-- All Orders (list with tabs)
 |    +-- Order Detail (timeline + actions)
 |    +-- Disputes (filtered view)
 |
 +-- Sell
 |    +-- My Auctions
 |    +-- Create Auction
 |    +-- Auction Detail (seller view)
 |    +-- Pending Shipments
 |    +-- Payouts
 |
 +-- [Arbiter] (role-gated)
      +-- Dispute Queue
      +-- Dispute Review
      +-- Resolution History
```

### 6.2 Page Descriptions

#### Auctions Landing Page

- **Header:** "Live Auctions" with a subtle animated dot indicating real-time updates
- **Filter Bar:** Category chips (Painting, Sculpture, Photography, Digital, Mixed Media) + Price range slider + "Ending in" dropdown
- **Grid:** 3-column (desktop), 2-column (tablet), 1-column (mobile). Each card shows: artwork image, title, artist, current bid, time remaining (countdown), number of bids
- **Empty state:** "No live auctions right now. Browse upcoming auctions or set alerts."
- **Scroll behavior:** Infinite scroll with skeleton loading cards

#### Auction Room

- See Section 2.3 for detailed layout
- **Accessibility:** All countdown timers have aria-live regions. Bid confirmation uses focus trapping. Color is never the sole indicator of state.
- **Performance:** Bid feed virtualized (render only visible items). Image lazy-loading with blur-up placeholder. WebSocket reconnection with exponential backoff.

#### My Bids Dashboard

- **Tab bar:** Active | Won | Lost | Withdrawals
- **Active tab:** Cards showing auction artwork, your current bid, whether you are highest bidder (green badge) or outbid (red badge), time remaining
- **Won tab:** Cards linking to order tracking
- **Withdrawals tab:** Total claimable amount, "Withdraw All" button, individual auction refund breakdown

#### Order List

- **Tabs:** All | Awaiting Shipment | Shipped | Completed | Disputed | Cancelled
- **Each card:** Artwork thumbnail (left), order number + date + status badge (center), amount (right), click/tap to expand to detail
- **Status badges color coding:** Amber (awaiting), Blue (shipped), Green (completed), Red (disputed/cancelled), Purple (escrow held)

#### Order Detail

- See Section 3.2 for detailed layout
- **Key UX principle:** The page adapts its calls-to-action based on the user role (buyer vs seller) and the current state. Only relevant, executable actions are shown.
- **Escrow transparency:** Always show: (a) how much is held, (b) where it is held (contract address, clickable to Etherscan), (c) what needs to happen next

#### Dispute Filing

- See Section 4.2 for detailed layout
- **Progressive disclosure:** Start with category selection, then reveal detail form, then evidence upload, then confirmation
- **Guardrails:** Require at least one evidence photo. Show gas estimate before submission. Explain the 30-day timeline clearly.

#### Arbiter Dashboard

- **Queue view:** Table with columns: Order ID, Artwork, Amount, Filed Date, Deadline, Status, Priority (calculated from deadline proximity)
- **Detail view:** See Section 4.2
- **Batch awareness:** If an arbiter has many disputes, show aggregate stats and deadline urgency at the top

### 6.3 Responsive Breakpoints

| Breakpoint | Layout Behavior |
|---|---|
| Desktop (>1200px) | Full side-by-side layouts, multi-column grids |
| Tablet (768-1200px) | 2-column grids, side panels collapse to tabs |
| Mobile (<768px) | Single column, bottom sheets for actions, sticky bottom bars for primary CTAs |

### 6.4 Key UX Principles

1. **Trust through transparency:** Every financial action (bid, escrow, release, refund) links to its on-chain transaction. Users can independently verify on Etherscan.
2. **Urgency without anxiety:** Countdown timers use color progression (green -> amber -> red) but always show the exact time. Tooltip explains what happens at deadline.
3. **Progressive disclosure:** Complex flows (bidding, disputing) are broken into clear steps with confirmation screens before irreversible on-chain actions.
4. **Contextual actions:** Buttons appear only when the action is valid for the current state. Disabled states are explained ("Available after delivery deadline").
5. **Real-time feedback:** Every state change reflects instantly via WebSocket. Optimistic UI for better perceived performance with rollback on failure.
6. **Mobile-first bidding:** The bid input and timer are always accessible. On mobile, a sticky bottom bar ensures one-tap bidding without scrolling.
7. **Recovery paths:** Outbid? One-tap re-bid. Dispute? Guided wizard. Timeout? Clear "Claim Refund" button with zero ambiguity.

---

## 7. Technical Alignment with Backend

### 7.1 New Backend Components Needed

| Component | Service | Description |
|---|---|---|
| `AuctionWebSocketGateway` | api-gateway | New Socket.IO namespace `/auction` for real-time bid broadcasting |
| `AuctionController` | api-gateway | REST endpoints for auction CRUD, bid history, auction state queries |
| `AuctionEventHandler` | api-gateway or orders-service | RabbitMQ subscriber that broadcasts blockchain events to WebSocket rooms |
| Auction listing entity/query | artwork-service or orders-service | Persist auction metadata (duration, reserve, artwork reference) for browsing |
| Dispute entity | orders-service | Store dispute details (reason, evidence IPFS hashes, messages, resolution) |
| DisputeController | api-gateway | REST endpoints for filing disputes, uploading evidence, viewing status |
| Arbiter endpoints | api-gateway | Role-gated endpoints for dispute queue, resolution |
| Notification triggers | notifications-service | New trigger events for auction/order/dispute lifecycle |
| Deadline scheduler | orders-service | Cron job checking approaching deadlines to trigger warning notifications |
| Withdraw endpoint | api-gateway | REST endpoint to call `EscrowContractService` for pending returns + withdraw |

### 7.2 Existing Components to Extend

| Component | Change Needed |
|---|---|
| `BlockchainEventHandler` (orders-service) | Add handlers for `NewBid`, `AuctionStarted`, `AuctionExtended`, `ShippingTimeout`, `DeliveryTimeout` |
| `OrdersMicroserviceController` | Add endpoints for order-by-wallet, orders-by-status, order actions (confirm delivery, open dispute) |
| `NotificationTriggerEvent` enum | Add 15 new event types (see Section 5.4) |
| `EscrowContractService` | Already has `getAuction` and `getAuctionTimeline`; add `getPendingReturns` integration at API level |
| `Order` entity | Add `disputeReason`, `disputeEvidenceHashes`, `disputeFiledAt`, `disputeResolvedAt` columns |
| `ArtworkStatus` enum | Add `ON_AUCTION` status to indicate artwork currently in active auction |

### 7.3 Data Flow Summary

```
[User Action in Browser]
        |
        v
[API Gateway REST/WebSocket] -- JWT Auth -->
        |
        v (TCP RPC)
[orders-service / artwork-service]
        |
        v (for on-chain actions)
[User's Wallet via Frontend] -- direct contract call -->
        |
        v
[ArtAuctionEscrow Smart Contract]
        |
        v (emits Solidity events)
[BlockchainEventListenerService] -- Outbox --> [RabbitMQ]
        |                                           |
        v                                           v
[orders-service: sync DB]              [api-gateway: broadcast WebSocket]
                                                    |
                                                    v
                                        [All connected clients update UI]
```

**Important architectural note:** Bids and other on-chain actions (markShipped, confirmDelivery, openDispute, resolveDispute) are initiated by the user's wallet directly calling the smart contract from the frontend. The backend does NOT proxy these transactions -- it only listens for the resulting events and updates internal state. This keeps the user's private key on the client side and the backend stateless regarding on-chain writes.
