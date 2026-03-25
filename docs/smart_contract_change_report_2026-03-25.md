# 📘 Báo Cáo Thay Đổi Chi Tiết — ArtAuctionEscrow

**Ngày cập nhật:** 2026-03-25  
**Phạm vi:** `BE/smart-contracts`  
**Mục tiêu:** Bổ sung edge case còn thiếu + tối ưu an toàn, không phá API public.

---

## 1) Tóm tắt kết quả

- Giữ nguyên behavior nghiệp vụ cốt lõi, đặc biệt `claimShippingTimeout` vẫn cho phép `anyone`.
- Không thay đổi chữ ký hàm public, event, enum state, custom error.
- Tăng độ bao phủ test theo hướng boundary + adversarial (transfer failure).
- Tối ưu compile/gas bằng optimizer và `immutable` (không đổi interface truy cập public getter).

**Kết quả test hiện tại**
- `npx hardhat test test/ArtAuctionEscrow.test.ts` → **81 passing, 0 failing**.
- `npx hardhat coverage`:
  - `ArtAuctionEscrow.sol`: **100% statements / 100% lines / 100% funcs / 95.69% branches**.
  - `AdversarialHelpers.sol`: **100% toàn bộ**.

---

## 2) Thay đổi theo file

### A. Contract chính
**File:** `BE/smart-contracts/contracts/ArtAuctionEscrow.sol`

Thay đổi:
- Chuyển 3 biến cấu hình sang `immutable`:
  - `arbiter`
  - `platformFeeBps`
  - `platformWallet`

Ý nghĩa:
- Giảm gas truy cập storage cho các biến cố định sau deploy.
- Không đổi ABI getter public (`arbiter()`, `platformFeeBps()`, `platformWallet()` vẫn giữ nguyên).

---

### B. Cấu hình Hardhat
**File:** `BE/smart-contracts/hardhat.config.ts`

Thay đổi:
- Chuyển từ `solidity: "0.8.20"` sang cấu hình đầy đủ:
  - `optimizer.enabled = true`
  - `optimizer.runs = 200`

Ý nghĩa:
- Tối ưu bytecode/runtime gas cho các hàm.

---

### C. Helper contracts cho test adversarial
**File:** `BE/smart-contracts/contracts/test/AdversarialHelpers.sol` (mới)

Thêm 3 contract test-only:
- `RejectEtherReceiver`: `receive()` luôn revert.
- `RevertingBidder`: có thể bid vào escrow nhưng khi nhận ETH qua `withdraw()` sẽ revert.
- `RevertingSellerAgent`: đóng vai seller contract, khi nhận ETH sẽ revert.

Mục đích:
- Ép nhánh `TransferFailed` trong `withdraw()` và payout path (`confirmDelivery`).

---

### D. Test suite
**File:** `BE/smart-contracts/test/ArtAuctionEscrow.test.ts`

#### 1) Bổ sung fixture
- `auctionDisputedFixture()`
- `deployZeroFeeFixture()`

#### 2) Bổ sung edge case & boundary (21 test mới)

**Nhóm `bid`**
- InvalidState khi auction đã `Cancelled`.
- Boundary: bid tại đúng `endTime` phải revert.
- Boundary anti-snipe: còn đúng 10 phút thì **không** gia hạn.

**Nhóm `endAuction`**
- `AuctionNotFound` cho `orderId` giả.
- InvalidState khi gọi `endAuction` lần 2.
- Boundary: gọi đúng `endTime` thành công.

**Nhóm `cancelAuction`**
- InvalidState khi auction đã `Ended`.

**Nhóm `markShipped`**
- Boundary: gọi đúng `shippingDeadline` vẫn thành công.

**Nhóm `claimShippingTimeout`**
- Boundary: gọi đúng `shippingDeadline` phải revert.
- Xác nhận `anyone` có thể gọi, nhưng tiền vẫn về đúng buyer.

**Nhóm `openDispute`**
- InvalidState khi chưa `Shipped`.
- Boundary: gọi đúng `deliveryDeadline` vẫn thành công.

**Nhóm `claimDeliveryTimeout`**
- InvalidState khi state là `Disputed`.
- Boundary: gọi đúng `deliveryDeadline` phải revert.

**Nhóm `claimDisputeTimeout`**
- InvalidState khi state không phải `Disputed`.
- Boundary: gọi đúng `disputeDeadline` phải revert.

**Additional Edge Cases**
- Multi-auction isolation (`ORDER_ID` và `ORDER_ID_2` không chéo dữ liệu/timeline).
- Fee = 0 payout path: `confirmDelivery` chuyển toàn bộ cho seller, platform nhận 0.

**TransferFailed (Adversarial)**
- `withdraw` fail khi receiver từ chối ETH.
- `confirmDelivery` fail khi `platformWallet` từ chối ETH.
- `confirmDelivery` fail khi seller từ chối ETH.
- Có kiểm tra rollback state/fund khi transfer revert.

---

### E. Tài liệu
**File:** `BE/smart-contracts/README.md`

Đồng bộ lại shipping window:
- Từ **3 ngày** → **5 ngày** tại phần state transition và timeout table.

---

## 3) So sánh gas trước/sau

> Lưu ý: baseline trước thay đổi lấy từ lần đo cũ (optimizer tắt, bộ test cũ 60 case); sau thay đổi đo với optimizer bật và bộ test mới.

| Method / Deploy | Trước | Sau | Chênh lệch | % |
|---|---:|---:|---:|---:|
| Deploy `ArtAuctionEscrow` | 3,446,614 | 2,125,660 | -1,320,954 | -38.33% |
| `bid` (avg) | 80,964 | 79,718 | -1,246 | -1.54% |
| `cancelAuction` (avg) | 52,777 | 51,808 | -969 | -1.84% |
| `claimDeliveryTimeout` (avg) | 61,842 | 55,728 | -6,114 | -9.89% |
| `claimDisputeTimeout` (avg) | 60,369 | 59,294 | -1,075 | -1.78% |
| `claimShippingTimeout` (avg) | 59,341 | 58,574 | -767 | -1.29% |
| `confirmDelivery` (avg) | 64,180 | 55,394 | -8,786 | -13.69% |
| `createAuction` (avg) | 175,982 | 175,021 | -961 | -0.55% |
| `endAuction` (avg) | 79,383 | 78,957 | -426 | -0.54% |
| `markShipped` (avg) | 82,195 | 80,888 | -1,307 | -1.59% |
| `openDispute` (avg) | 59,329 | 58,249 | -1,080 | -1.82% |
| `resolveDispute` (avg) | 63,576 | 57,827 | -5,749 | -9.04% |
| `withdraw` (avg) | 33,164 | 32,542 | -622 | -1.88% |

---

## 4) Tính tương thích API / tích hợp

- **Không đổi ABI public** (function signatures/events/errors/state enum giữ nguyên).
- Không đổi rule nghiệp vụ đã chốt:
  - `claimShippingTimeout` vẫn callable bởi `anyone`.
- Phù hợp mục tiêu “an toàn, không phá integration backend/frontend”.

---

## 5) Checklist nghiệm thu

- [x] Bổ sung edge case còn thiếu theo plan.
- [x] Có adversarial test cho `TransferFailed`.
- [x] Bật optimizer trong Hardhat config.
- [x] Chuyển biến cấu hình sang `immutable`.
- [x] Cập nhật README cho shipping window 5 ngày.
- [x] Test file mục tiêu pass 100%.
- [x] Coverage giữ 100% line/statement cho contract chính.

