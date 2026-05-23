# ARTIUM Smart Contracts

Thư mục `contracts/` là Hardhat project cho smart contract blockchain của ARTIUM. Contract chính là `ArtAuctionEscrow`, phục vụ đấu giá và ký quỹ ETH cho tác phẩm nghệ thuật vật lý trong kiến trúc hybrid on-chain/off-chain.

## Thông Tin Contract Đã Deploy

| Nội dung  | Thông tin                                                                         |
| --------- | --------------------------------------------------------------------------------- |
| Contract  | `ArtAuctionEscrow`                                                                |
| Ngôn ngữ  | Solidity `0.8.20`                                                                 |
| Framework | Hardhat                                                                           |
| Testnet   | Sepolia                                                                           |
| Địa chỉ   | `0x59D1Cff823e14d8E874CF35619a021dC43f5eff0`                                      |
| Explorer  | <https://sepolia.etherscan.io/address/0x59D1Cff823e14d8E874CF35619a021dC43f5eff0> |
| Ví deploy | `0x77a2Ac8226Cdbb13aD77859B204405ABb0AE2E89`                                      |

## Cấu Trúc Thư Mục

```text
contracts/
├── contracts/
│   └── ArtAuctionEscrow.sol     # Contract đấu giá và escrow
├── scripts/
│   ├── deploy.local.ts          # Deploy lên local Hardhat network
│   └── deploy.ts                # Deploy lên network cấu hình, ví dụ Sepolia
├── test/
│   └── ArtAuctionEscrow.test.ts # Hardhat/Mocha/Chai tests
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

## Cài Đặt Và Kiểm Tra

```bash
cd contracts
npm install
npm run compile
npm test
```

Script có sẵn:

| Lệnh                                                          | Công dụng                               |
| ------------------------------------------------------------- | --------------------------------------- |
| `npm run compile`                                             | Compile Solidity contract bằng Hardhat. |
| `npm test`                                                    | Chạy Hardhat test suite.                |
| `npx hardhat node`                                            | Chạy local Ethereum node.               |
| `npx hardhat run scripts/deploy.local.ts --network localhost` | Deploy contract lên local node.         |
| `npx hardhat run scripts/deploy.ts --network sepolia`         | Deploy contract lên Sepolia.            |

## Biến Môi Trường Deploy

Tạo file `.env` local trong `contracts/` nếu cần deploy hoặc verify:

```env
SEPOLIA_RPC_URL=https://your-sepolia-rpc-endpoint
PRIVATE_KEY=your_deployer_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key

ARBITER_ADDRESS=0xYourArbiterAddress
PLATFORM_WALLET_ADDRESS=0xYourPlatformWallet
PLATFORM_FEE_BPS=250
```

Không commit `.env`, private key, mnemonic phrase hoặc RPC secret.

## Constructor

```solidity
constructor(address arbiter, address payable platformWallet, uint256 platformFeeBps)
```

Ba giá trị trên là immutable sau deploy. `platformFeeBps` bị giới hạn tối đa 10% qua `MAX_FEE_BPS = 1000`.

## Vai Trò

| Vai trò  | Mô tả                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Seller   | Tạo auction, đánh dấu đã giao hàng và nhận tiền khi hoàn tất.                  |
| Buyer    | Bid cao nhất, xác nhận giao hàng, mở tranh chấp hoặc claim refund khi quá hạn. |
| Arbiter  | Giải quyết tranh chấp, được cấu hình tại lúc deploy.                           |
| Platform | Nhận platform fee theo basis points trên giao dịch hoàn tất.                   |

## Trạng Thái Auction

```text
Started -> Ended -> Shipped -> Completed
   |         |        |
   v         v        v
Cancelled  Cancelled  Disputed -> Completed
                         |
                         v
                      Cancelled
```

| State       | Ý nghĩa                                                     |
| ----------- | ----------------------------------------------------------- |
| `Started`   | Auction đang mở và nhận bid.                                |
| `Ended`     | Auction kết thúc, reserve được đạt, chờ seller giao hàng.   |
| `Shipped`   | Seller đã gửi tracking proof, chờ buyer xác nhận.           |
| `Disputed`  | Buyer mở tranh chấp, chờ arbiter xử lý.                     |
| `Completed` | Tiền đã được giải ngân cho seller sau khi trừ platform fee. |
| `Cancelled` | Auction hủy, tiền hoàn về `pendingReturns` để buyer rút.    |

## Chức Năng Chính

| Function               | Mô tả                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `createAuction`        | Tạo auction mới và liên kết với `orderId` off-chain.                                  |
| `bid`                  | Đặt bid bằng ETH, cập nhật highest bidder và cộng pending return cho bidder cũ.       |
| `withdraw`             | Rút tiền refund/outbid từ `pendingReturns`.                                           |
| `endAuction`           | Kết thúc auction, chuyển sang `Ended` nếu đạt reserve hoặc `Cancelled` nếu không đạt. |
| `cancelAuction`        | Seller hủy auction khi chưa có bid.                                                   |
| `markShipped`          | Seller ghi tracking hash và chuyển sang `Shipped`.                                    |
| `confirmDelivery`      | Buyer xác nhận nhận hàng, giải ngân tiền cho seller.                                  |
| `openDispute`          | Buyer mở tranh chấp trước delivery deadline.                                          |
| `resolveDispute`       | Arbiter xử lý tranh chấp theo hướng buyer hoặc seller.                                |
| `claimShippingTimeout` | Buyer claim refund nếu seller không ship đúng hạn.                                    |
| `claimDeliveryTimeout` | Seller claim payout nếu buyer không xác nhận đúng hạn.                                |
| `claimDisputeTimeout`  | Buyer claim refund nếu tranh chấp quá hạn xử lý.                                      |
| `getAuction`           | Đọc thông tin auction.                                                                |
| `getAuctionTimeline`   | Đọc các mốc thời gian của auction.                                                    |

## Event

Contract emit các event để backend/indexer đồng bộ trạng thái:

- `AuctionStarted`
- `NewBid`
- `AuctionEnded`
- `Withdrawn`
- `DeliveryConfirmed`
- `AuctionCancelled`
- `AuctionExtended`
- `ArtShipped`
- `DisputeOpened`
- `DisputeResolved`
- `ShippingTimeout`
- `DeliveryTimeout`

## Timeout Windows

| Window             | Thời lượng      | Bắt đầu sau                          |
| ------------------ | --------------- | ------------------------------------ |
| Anti-snipe         | Gia hạn 10 phút | Có bid trong 10 phút cuối auction.   |
| Shipping           | 5 ngày          | `endAuction()` khi reserve được đạt. |
| Delivery           | 14 ngày         | `markShipped()`.                     |
| Dispute resolution | 30 ngày         | `openDispute()`.                     |

## Payment Flow

Khi hoàn tất qua `confirmDelivery`, `claimDeliveryTimeout` hoặc `resolveDispute(false)`:

```text
totalAmount = highestBid
platformFee = totalAmount * platformFeeBps / 10000
sellerPayout = totalAmount - platformFee
```

Mọi refund do outbid, cancel hoặc dispute favor buyer được ghi vào `pendingReturns[address]`; người dùng gọi `withdraw()` để rút tiền. Contract dùng `ReentrancyGuard` để giảm rủi ro reentrancy.

## Tích Hợp Với Website

Frontend gửi transaction qua MetaMask trên Sepolia. Backend ghi nhận `txHash`, xác minh transaction, lắng nghe event contract và cập nhật order/payment trong database để UI hiển thị trạng thái mới nhất.
