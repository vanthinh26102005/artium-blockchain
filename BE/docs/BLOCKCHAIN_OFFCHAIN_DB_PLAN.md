# Blockchain Off-chain Database Plan (PostgreSQL)

## 1) Mục tiêu
- Dự án dùng mô hình hybrid: on-chain cho tính minh bạch, off-chain cho truy vấn nhanh.
- Frontend không gọi RPC liên tục.
- Dữ liệu on-chain được đồng bộ về PostgreSQL qua indexer/worker đúng vai trò "System role" trong kiến trúc S1.

## 2) Hiện trạng codebase BE (đã rà soát)
- Backend theo microservices + event-driven + PostgreSQL.
- Hạ tầng hiện tại ưu tiên `DB_STRATEGY=SHARED` (mỗi service một schema trong `artium_global`).
- `orders-service` hiện còn skeleton, phù hợp để tích hợp phần blockchain read-model từ đầu.
- Chưa có blockchain indexer/worker riêng trong BE ở thời điểm hiện tại.

## 3) Phạm vi collection/bảng cần có (off-chain)
Theo yêu cầu task:
- `users`
- `artworks`
- `auctions`
- `bids` (optional)
- `orders`
- `transactions` (receipt)
- `sync_state` (lastProcessedBlock)

## 4) Đề xuất thiết kế bảng SQL (base)

### 4.1 `users` (projection)
Mục tiêu: mapping user nội bộ với wallet để join nhanh.

Cột chính:
- `user_id UUID PK`
- `wallet_address VARCHAR(42) UNIQUE NOT NULL`
- `display_name VARCHAR(255)`
- `avatar_url VARCHAR(1024)`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Index:
- `UNIQUE(wallet_address)`

### 4.2 `artworks` (projection)
Mục tiêu: trạng thái bán + liên kết NFT/token.

Cột chính:
- `artwork_id UUID PK`
- `seller_user_id UUID NOT NULL`
- `title VARCHAR(255) NOT NULL`
- `price_wei NUMERIC(78,0)`
- `currency VARCHAR(10) DEFAULT 'ETH'`
- `contract_address VARCHAR(42)`
- `token_id NUMERIC(78,0)`
- `status VARCHAR(30)` (`DRAFT|ACTIVE|IN_AUCTION|SOLD|ARCHIVED`)
- `metadata JSONB`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Index:
- `(seller_user_id, status)`
- `(contract_address, token_id)` unique when token is minted

### 4.3 `auctions`
Mục tiêu: read-model cho đấu giá on-chain.

Cột chính:
- `auction_id VARCHAR(100) PK` (hoặc UUID nếu contract emit UUID-like id)
- `artwork_id UUID NOT NULL`
- `seller_user_id UUID NOT NULL`
- `start_at TIMESTAMPTZ NOT NULL`
- `end_at TIMESTAMPTZ NOT NULL`
- `reserve_price_wei NUMERIC(78,0)`
- `highest_bid_wei NUMERIC(78,0)`
- `highest_bidder_wallet VARCHAR(42)`
- `status VARCHAR(30)` (`PENDING|ACTIVE|ENDED|SETTLED|CANCELLED`)
- `created_tx_hash VARCHAR(66)`
- `chain_id BIGINT NOT NULL`
- `contract_address VARCHAR(42) NOT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Index:
- `(status, end_at)`
- `(artwork_id)`
- `(chain_id, contract_address, auction_id)` unique

### 4.4 `bids` (optional nhưng nên có)
Mục tiêu: lịch sử bid + audit.

Cột chính:
- `bid_id BIGSERIAL PK`
- `auction_id VARCHAR(100) NOT NULL`
- `bidder_user_id UUID`
- `bidder_wallet VARCHAR(42) NOT NULL`
- `amount_wei NUMERIC(78,0) NOT NULL`
- `tx_hash VARCHAR(66) NOT NULL`
- `block_number BIGINT NOT NULL`
- `log_index INT NOT NULL`
- `status VARCHAR(20)` (`PLACED|OUTBID|WINNING|SETTLED|CANCELLED`)
- `created_at TIMESTAMPTZ`

Index/constraint:
- `UNIQUE(chain_id, tx_hash, log_index)`
- `(auction_id, amount_wei DESC)`
- `(bidder_wallet, created_at DESC)`

### 4.5 `orders`
Mục tiêu: đơn hàng off-chain đã đồng bộ trạng thái escrow on-chain.

Cột chính:
- `order_id UUID PK`
- `onchain_order_id VARCHAR(100) NOT NULL`
- `buyer_user_id UUID NOT NULL`
- `seller_user_id UUID NOT NULL`
- `artwork_id UUID NOT NULL`
- `amount_wei NUMERIC(78,0) NOT NULL`
- `escrow_status VARCHAR(30)` (`PENDING|PAID|CONFIRMED|RELEASED|REFUNDED|DISPUTED`)
- `pay_tx_hash VARCHAR(66)`
- `confirm_tx_hash VARCHAR(66)`
- `refund_tx_hash VARCHAR(66)`
- `paid_at TIMESTAMPTZ`
- `confirmed_at TIMESTAMPTZ`
- `refunded_at TIMESTAMPTZ`
- `chain_id BIGINT NOT NULL`
- `contract_address VARCHAR(42) NOT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Index/constraint:
- `UNIQUE(chain_id, contract_address, onchain_order_id)`
- `(buyer_user_id, created_at DESC)`
- `(seller_user_id, created_at DESC)`
- `(escrow_status, updated_at DESC)`

### 4.6 `transactions` (receipt)
Mục tiêu: bằng chứng truy xuất giao dịch cho UI/Admin/Audit.

Cột chính:
- `tx_id BIGSERIAL PK`
- `chain_id BIGINT NOT NULL`
- `tx_hash VARCHAR(66) NOT NULL`
- `block_number BIGINT NOT NULL`
- `block_hash VARCHAR(66)`
- `from_wallet VARCHAR(42)`
- `to_wallet VARCHAR(42)`
- `tx_type VARCHAR(30)` (`ORDER_CREATED|DELIVERY_CONFIRMED|REFUND|BID_PLACED|AUCTION_SETTLED|NFT_MINTED`)
- `order_id UUID`
- `auction_id VARCHAR(100)`
- `amount_wei NUMERIC(78,0)`
- `gas_used NUMERIC(30,0)`
- `effective_gas_price_wei NUMERIC(78,0)`
- `status VARCHAR(20)` (`SUCCESS|FAILED|REVERTED`)
- `event_name VARCHAR(100)`
- `event_payload JSONB`
- `tx_timestamp TIMESTAMPTZ`
- `created_at TIMESTAMPTZ`

Index/constraint:
- `UNIQUE(chain_id, tx_hash, event_name, block_number)`
- `(order_id)`
- `(auction_id)`
- `(tx_timestamp DESC)`

### 4.7 `sync_state`
Mục tiêu: checkpoint cho indexer/worker, tránh scan lại toàn bộ chain.

Cột chính:
- `sync_id BIGSERIAL PK`
- `indexer_name VARCHAR(100) NOT NULL`
- `chain_id BIGINT NOT NULL`
- `contract_address VARCHAR(42) NOT NULL`
- `last_processed_block BIGINT NOT NULL`
- `last_processed_log_index INT DEFAULT 0`
- `status VARCHAR(20)` (`IDLE|RUNNING|ERROR`)
- `last_error TEXT`
- `heartbeat_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Index/constraint:
- `UNIQUE(indexer_name, chain_id, contract_address)`

## 5) Nguyên tắc đồng bộ on-chain -> off-chain
- Worker đọc checkpoint từ `sync_state`.
- Query event logs theo batch block (VD: 500-2000 block/lần).
- Chỉ xử lý block đã đủ confirmations (VD: 12 block) để giảm rủi ro reorg.
- Mỗi event dùng upsert/idempotent key (`chain_id + tx_hash + log_index`).
- Sau khi commit dữ liệu nghiệp vụ thành công mới update `sync_state`.
- Nếu lỗi: lưu `last_error`, retry có backoff.

## 6) Đề xuất chỗ đặt schema/service

### Option A (khuyến nghị)
Tạo service/schema riêng cho blockchain read-model (ví dụ: `blockchain-sync-service` / schema `blockchain`).

Ưu điểm:
- Tách biệt domain blockchain khỏi orders/payments truyền thống.
- Dễ scale worker độc lập.
- Tránh coupling mạnh vào service còn đang phát triển.

### Option B
Gộp trực tiếp vào `orders-service`.

Ưu điểm:
- Triển khai nhanh, ít service mới.

Nhược điểm:
- Domain `orders` bị phình to.
- Sau này tách worker/indexer sẽ tốn công refactor.

## 7) Milestone triển khai đề xuất
1. Chốt Option A/B với leader.
2. Tạo migration v1 cho 7 bảng base.
3. Tạo worker indexer + map event contract.
4. Tạo API read-model cho frontend.
5. Backfill dữ liệu từ block deploy contract.
6. Test idempotency, restart worker, duplicate logs, reorg nhẹ.

## 8) Checklist quyết định để chốt với leader
- Chọn Option A hay B?
- Chain target chính: Sepolia only hay có multi-chain?
- Có bắt buộc module `bids` ngay phase 1 không?
- Chuẩn `escrow_status` cuối cùng (enum) dùng chung FE/BE.
- Chính sách confirmations (6/12 block).
- Dùng migration chuẩn ngay từ đầu (không phụ thuộc `synchronize=true` ở production).

---

## Kết luận ngắn
Thiết kế trên đáp ứng đúng mục tiêu: frontend đọc DB nhanh, backend indexer/worker sync trạng thái on-chain về off-chain, đảm bảo minh bạch + hiệu năng + khả năng mở rộng cho đồ án.
