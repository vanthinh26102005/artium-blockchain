# 📋 Báo Cáo Kết Quả Unit Test — ArtAuctionEscrow v2

**Ngày chạy test:** 2026-03-23  
**Nhánh:** `feat-integration-order-flow`  
**Công cụ:** Hardhat v2.22 + Chai + Ethers v6  
**Kết quả:** ✅ **60/60 PASSED** (721ms)

---

## Tổng quan Smart Contract

| Thuộc tính | Giá trị |
|---|---|
| **Tên contract** | `ArtAuctionEscrow` |
| **Solidity** | ^0.8.20 |
| **Vị trí** | `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` (454 dòng) |
| **Bảo mật** | `ReentrancyGuard`, Pull-over-Push, Custom Errors (tiết kiệm gas) |
| **Vai trò** | Seller, Buyer, Arbiter |
| **Trạng thái** | `Started → Ended → Shipped → Completed` / `Disputed` / `Cancelled` |
| **Tính năng mới** | Anti-snipe, Reserve Price, Min Bid Increment, Platform Fee, Shipping/Delivery/Dispute Timeout |

---

## So sánh với phiên bản cũ (nhánh `test/escrow-contract`)

| Tiêu chí | v1 (cũ) | v2 (mới) |
|---|---|---|
| Số hàm | 5 | 12 |
| Số trạng thái | 4 (Cancelled chưa dùng) | 6 (đều có logic) |
| Constructor | Không tham số | `arbiter`, `platformWallet`, `platformFeeBps` |
| Error handling | `require("message")` | Custom Errors (tiết kiệm gas) |
| Anti-snipe | ❌ | ✅ (gia hạn 10 phút nếu bid trong 10 phút cuối) |
| Reserve Price | ❌ | ✅ (tự huỷ nếu giá thầu < giá sàn) |
| Min Bid Increment | ❌ | ✅ (bước giá tối thiểu) |
| Platform Fee | ❌ | ✅ (tối đa 10%, chia tự động) |
| Shipping flow | ❌ | ✅ (`markShipped` + `trackingHash`) |
| Dispute flow | ❌ | ✅ (`openDispute` → `resolveDispute`) |
| Timeout protection | ❌ | ✅ (3 loại timeout) |
| Access control | Ai cũng gọi được | Modifiers: `onlySeller`, `onlyBuyer`, `onlyArbiter` |
| Số test cases | 33 | **60** |

---

## Kết quả chi tiết

### 1. Constructor — Deploy hợp đồng (5/5 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Deploy thành công với tham số hợp lệ | ✅ |
| 2 | Revert nếu `arbiter` là `address(0)` | ✅ |
| 3 | Revert nếu `platformWallet` là `address(0)` | ✅ |
| 4 | Revert nếu phí > MAX_FEE_BPS (10%) | ✅ |
| 5 | Deploy với phí = 0 (miễn phí nền tảng) | ✅ |

### 2. `createAuction` — Tạo phiên đấu giá (5/5 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Tạo thành công, kiểm tra event + dữ liệu lưu trữ | ✅ |
| 2 | Revert nếu `orderId` trùng | ✅ |
| 3 | Revert nếu `duration = 0` | ✅ |
| 4 | Revert nếu `minBidIncrement = 0` | ✅ |
| 5 | Cho phép `reservePrice = 0` (không giới hạn giá sàn) | ✅ |

### 3. `bid` — Đặt giá thầu (9/9 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Bid thành công lần đầu (>= `minBidIncrement`) | ✅ |
| 2 | Revert nếu bid đầu < `minBidIncrement` | ✅ |
| 3 | Bid thứ 2 phải >= `highestBid + minBidIncrement` | ✅ |
| 4 | Revert nếu seller tự bid | ✅ |
| 5 | Revert nếu bid sau khi hết thời gian | ✅ |
| 6 | Revert nếu `orderId` không tồn tại | ✅ |
| 7 | Cập nhật `pendingReturns` cho người bị outbid | ✅ |
| 8 | **Anti-snipe:** gia hạn thời gian nếu bid trong 10 phút cuối | ✅ |
| 9 | Không gia hạn nếu bid ngoài cửa sổ anti-snipe | ✅ |

### 4. `endAuction` — Kết thúc phiên (5/5 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Thành công khi `highestBid >= reservePrice` → state `Ended` | ✅ |
| 2 | Tự hủy khi `highestBid < reservePrice` → hoàn tiền bidder | ✅ |
| 3 | Tự hủy khi không có ai bid | ✅ |
| 4 | Revert nếu chưa hết thời gian | ✅ |
| 5 | Revert nếu người gọi không phải seller | ✅ |

### 5. `cancelAuction` — Hủy phiên (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Seller hủy khi chưa có ai bid | ✅ |
| 2 | Revert nếu đã có người bid | ✅ |
| 3 | Revert nếu không phải seller | ✅ |

### 6. `markShipped` — Đánh dấu đã gửi hàng (4/4 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Seller đánh dấu thành công, lưu `trackingHash` | ✅ |
| 2 | Revert nếu không phải seller | ✅ |
| 3 | Revert nếu quá hạn shipping (5 ngày) | ✅ |
| 4 | Revert nếu state không phải `Ended` | ✅ |

### 7. `confirmDelivery` — Xác nhận nhận hàng (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Buyer xác nhận → tiền chia đúng (seller + platform fee) | ✅ |
| 2 | Revert nếu không phải buyer | ✅ |
| 3 | Revert nếu state không phải `Shipped` | ✅ |

### 8. `claimShippingTimeout` — Hoàn tiền khi seller không ship (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Buyer nhận hoàn tiền sau 5 ngày seller không ship | ✅ |
| 2 | Revert nếu chưa hết hạn shipping | ✅ |
| 3 | Revert nếu state không phải `Ended` | ✅ |

### 9. `openDispute` — Mở tranh chấp (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Buyer mở dispute thành công | ✅ |
| 2 | Revert nếu không phải buyer | ✅ |
| 3 | Revert nếu quá 14 ngày (delivery deadline) | ✅ |

### 10. `resolveDispute` — Arbiter phân xử (4/4 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Phân xử cho Buyer → hoàn tiền | ✅ |
| 2 | Phân xử cho Seller → chuyển tiền (có trừ fee) | ✅ |
| 3 | Revert nếu không phải arbiter | ✅ |
| 4 | Revert nếu state không phải `Disputed` | ✅ |

### 11. `claimDeliveryTimeout` — Seller ép giải ngân (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Seller nhận tiền sau 14 ngày buyer im lặng | ✅ |
| 2 | Revert nếu chưa hết hạn delivery | ✅ |
| 3 | Revert nếu không phải seller | ✅ |

### 12. `claimDisputeTimeout` — Buyer nhận tiền khi arbiter mất tích (3/3 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Buyer nhận tiền sau 30 ngày arbiter không phán xử | ✅ |
| 2 | Revert nếu chưa hết 30 ngày | ✅ |
| 3 | Revert nếu không phải buyer | ✅ |

### 13. `withdraw` — Rút tiền (2/2 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | Rút tiền thành công, kiểm tra event + balance | ✅ |
| 2 | Revert nếu `pendingReturns = 0` | ✅ |

### 14. View functions (2/2 ✅)

| # | Test Case | Kết quả |
|---|---|---|
| 1 | `getAuction` trả về dữ liệu chính xác | ✅ |
| 2 | `getAuctionTimeline` trả về tracking + deadline đúng | ✅ |

### 15. Full Flow — Integration (6/6 ✅)

| # | Kịch bản | Kết quả |
|---|---|---|
| 1 | **Happy path:** tạo → bid → end → ship → confirm → tiền chia đúng | ✅ |
| 2 | **Dispute flow:** ship → dispute → arbiter xử buyer thắng → buyer rút tiền | ✅ |
| 3 | **Shipping timeout:** seller bùng kèo 5 ngày → buyer hoàn tiền | ✅ |
| 4 | **Delivery timeout:** buyer im 14 ngày → seller ép giải ngân | ✅ |
| 5 | **Dispute timeout:** arbiter mất tích 30 ngày → buyer tự nhận lại | ✅ |
| 6 | **Reserve not met:** giá thầu < giá sàn → cancel + hoàn tiền | ✅ |

---

## Lỗi phát sinh & cách xử lý trong quá trình test

### Lỗi 1: `withdraw` — Gọi 2 lần gây revert (Lần chạy đầu: 59/60)

**Nguyên nhân:** Test ban đầu gọi `artAuction.connect(bidder1).withdraw()` lần đầu để kiểm tra event `Withdrawn`, sau đó gọi lần thứ 2 để kiểm tra `changeEtherBalances`. Lần gọi thứ 2 bị revert vì `pendingReturns` đã bị xóa về 0 ở lần gọi đầu tiên → Custom Error `NoFundsToWithdraw()`.

**Cách sửa:** Lưu transaction vào biến `tx` trước khi thực thi, sau đó dùng biến `tx` đó cho cả 2 assertion (`emit` và `changeEtherBalances`). Cách này đảm bảo chỉ thực thi giao dịch 1 lần duy nhất trên blockchain, nhưng vẫn kiểm tra được cả event lẫn biến động số dư.

```diff
- await expect(artAuction.connect(bidder1).withdraw())
+ const tx = artAuction.connect(bidder1).withdraw();
+
+ await expect(tx)
    .to.emit(artAuction, "Withdrawn")
    .withArgs(bidder1.address, bid1);

- await expect(artAuction.connect(bidder1).withdraw())
+ await expect(tx)
    .to.changeEtherBalances([bidder1, artAuction], [bid1, -bid1]);
```

> [!NOTE]
> Đây là pattern phổ biến trong Hardhat test: khi cần kiểm tra nhiều assertion khác loại trên cùng 1 giao dịch, lưu promise vào biến rồi `await expect()` nhiều lần trên cùng biến đó. Mỗi lần `await expect(tx)` sẽ replay lại cùng 1 transaction, không gọi giao dịch mới.
