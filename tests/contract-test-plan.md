### TEST PLAN: SMART CONTRACT ARTAUCTIONESCROW

#### 1. Function: `createAuction`

**TC-01: Tạo phiên đấu giá mới thành công (Positive)**
*   **Preconditions:** Smart contract đã được deploy. `orderId` là duy nhất chưa từng tồn tại trên contract.
*   **Steps:** 
    1. Gọi hàm `createAuction(orderId, seller, duration)` với `seller` là một địa chỉ ví hợp lệ.
    2. Truyền `duration` > 0 sao cho `block.timestamp + duration > block.timestamp`.
*   **Expected result:** Pass. Contract ghi nhận phiên đấu giá, trạng thái được set là `Started`, emit event `AuctionStarted`.

**TC-02: Tạo đấu giá với địa chỉ seller không hợp lệ (Negative)**
*   **Preconditions:** Smart contract đã được deploy. `orderId` hợp lệ.
*   **Steps:** Gọi hàm `createAuction(orderId, seller, duration)` với `seller` = `address(0)`.
*   **Expected result:** Revert. Message: `"Auction: Invalid seller address"`.

**TC-03: Tạo đấu giá với orderId đã tồn tại (Negative)**
*   **Preconditions:** Một phiên đấu giá với `orderId` = "ORDER_123" đã được tạo trước đó.
*   **Steps:** Gọi hàm `createAuction("ORDER_123", seller, duration)`.
*   **Expected result:** Revert. Message: `"Auction: Order ID already exists"`.

**TC-04: Tạo đấu giá với thời gian kết thúc không hợp lệ (Negative)**
*   **Preconditions:** Smart contract đã được deploy. `orderId` chưa tồn tại.
*   **Steps:** Gọi hàm `createAuction(orderId, seller, duration)` với `duration` = 0 (khiến `endTime` không lớn hơn `block.timestamp`).
*   **Expected result:** Revert. Message: `"Auction: End time must be in the future"`.

---

#### 2. Function: `bid`

**TC-05: Đặt giá lần đầu hợp lệ (Positive)**
*   **Preconditions:** Đã có phiên đấu giá với `orderId` đang ở trạng thái `Started`. `highestBid` hiện tại là 0. Thời gian chưa hết (`block.timestamp < endTime`).
*   **Steps:** Caller (Bidder 1) gọi `bid(orderId)` kèm theo `msg.value` = 1 ETH.
*   **Expected result:** Pass. `highestBidder` cập nhật thành Bidder 1, `highestBid` = 1 ETH. Emit event `NewBid`.

**TC-06: Đặt giá cao hơn giá hiện tại (Positive)**
*   **Preconditions:** Phiên đấu giá `orderId` đang `Started`. `highestBidder` hiện tại là Bidder 1 với `highestBid` = 1 ETH.
*   **Steps:** Caller (Bidder 2) gọi `bid(orderId)` kèm `msg.value` = 2 ETH.
*   **Expected result:** Pass. `highestBidder` chuyển thành Bidder 2, `highestBid` = 2 ETH. 1 ETH của Bidder 1 được cộng vào `pendingReturns[Bidder1]`. Emit event `NewBid`.

**TC-07: Đặt giá cho phiên đấu giá không tồn tại (Negative)**
*   **Preconditions:** `orderId` = "INVALID_ORDER" chưa được khởi tạo.
*   **Steps:** Gọi hàm `bid("INVALID_ORDER")` kèm `msg.value` = 1 ETH.
*   **Expected result:** Revert. Message: `"Auction: Order does not exist"`.

**TC-08: Đặt giá thấp hơn hoặc bằng giá hiện tại (Negative)**
*   **Preconditions:** Phiên đấu giá `orderId` đang `Started`, `highestBid` = 2 ETH.
*   **Steps:** Gọi hàm `bid(orderId)` kèm `msg.value` = 1 ETH (hoặc 2 ETH).
*   **Expected result:** Revert. Message: `"Auction: Bid too low"`.

**TC-09: Đặt giá khi đã quá thời gian kết thúc (Negative)**
*   **Preconditions:** Phiên đấu giá `orderId` đang có `block.timestamp >= endTime`.
*   **Steps:** Gọi hàm `bid(orderId)` với `msg.value` hợp lệ.
*   **Expected result:** Revert. Message: `"Auction: Already ended"`.

**TC-10: Đặt giá khi đấu giá không ở trạng thái Started (Negative)**
*   **Preconditions:** Phiên đấu giá `orderId` đã bị đổi trạng thái (ví dụ: đã Ended).
*   **Steps:** Gọi hàm `bid(orderId)` với `msg.value` hợp lệ.
*   **Expected result:** Revert. Message: `"Auction: Not in Started state"`.

**TC-11: Sniping - Đặt giá vào giây cuối cùng (Edge Case)**
*   **Preconditions:** Phiên đấu giá `orderId` có `endTime` là T. Hiện tại `block.timestamp` = T - 1. `highestBid` = 1 ETH.
*   **Steps:** Gọi `bid(orderId)` kèm `msg.value` = 2 ETH đúng 1 giây trước khi kết thúc.
*   **Expected result:** Pass. Do contract không chặn sniping và không tự gia hạn thời gian, transaction thành công và thay đổi `highestBidder` vào phút chót.

**TC-12: Người bán tự đặt giá (Self-bidding / Shill Bidding) (Edge Case)**
*   **Preconditions:** Phiên đấu giá đang `Started`. Caller chính là `seller` của `orderId` này.
*   **Steps:** Seller gọi `bid(orderId)` kèm `msg.value` lớn hơn `highestBid`.
*   **Expected result:** Pass. Do logic smart contract MVP không kiểm tra điều kiện `msg.sender != auction.seller`, giao dịch vẫn thành công.

---

#### 3. Function: `withdraw`

**TC-13: Rút tiền thành công khi có số dư (Positive)**
*   **Preconditions:** User A từng bid thua, `pendingReturns[UserA]` = 1 ETH.
*   **Steps:** User A gọi hàm `withdraw()`.
*   **Expected result:** Pass. User A nhận lại 1 ETH, `pendingReturns[UserA]` bị gán về 0 (Checks-Effects-Interactions). Emit event `Withdrawn(UserA, 1 ETH)`.

**TC-14: Rút tiền khi không có số dư (Negative)**
*   **Preconditions:** User B chưa từng tham gia bid hoặc đã rút hết tiền. `pendingReturns[UserB]` = 0.
*   **Steps:** User B gọi hàm `withdraw()`.
*   **Expected result:** Revert. Message: `"Auction: No funds to withdraw"`.

**TC-15: Chặn Re-entrancy Attack khi rút tiền (Edge Case)**
*   **Preconditions:** Caller là một malicious smart contract fallback. `pendingReturns[MaliciousContract]` > 0.
*   **Steps:** Malicious Contract gọi `withdraw()`, trong hàm fallback nhận tiền tiếp tục gọi lại `withdraw()` lần nữa.
*   **Expected result:** Pass (Revert ở lớp reentrancy). Giao dịch bị khóa do `nonReentrant` modifier và do số dư đã bị gán về 0 trước khi `call` chuyển tiền.

---

#### 4. Function: `endAuction`

**TC-16: Kết thúc phiên đấu giá thành công (Positive)**
*   **Preconditions:** Phiên đấu giá `orderId` đang `Started`. Đã quá thời gian kết thúc (`block.timestamp >= endTime`). Có người thắng thầu.
*   **Steps:** Bất kỳ user nào gọi hàm `endAuction(orderId)`.
*   **Expected result:** Pass. Trạng thái phiên đấu giá cập nhật thành `Ended`. Tiền thắng cược được giữ nguyên trên contract chờ `confirmDelivery`. Emit event `AuctionEnded`.

**TC-17: Gọi kết thúc khi chưa hết thời gian (Negative)**
*   **Preconditions:** Phiên đấu giá `orderId` đang `Started` và chưa đến `endTime` (`block.timestamp < endTime`).
*   **Steps:** Gọi hàm `endAuction(orderId)`.
*   **Expected result:** Revert. Message: `"Auction: Auction time has not expired"`.

**TC-18: Gọi kết thúc cho orderId không tồn tại (Negative)**
*   **Preconditions:** `orderId` không tồn tại trên hệ thống.
*   **Steps:** Gọi hàm `endAuction(orderId)`.
*   **Expected result:** Revert. Message: `"Auction: Order does not exist"`.

**TC-19: Gọi kết thúc khi đấu giá đã kết thúc hoặc bị hủy (Negative)**
*   **Preconditions:** Phiên đấu giá `orderId` đã ở trạng thái `Ended`, `Completed` hoặc `Cancelled` (khác `Started`). Quá trình `endTime` đã đạt điều kiện.
*   **Steps:** Gọi lại hàm `endAuction(orderId)`.
*   **Expected result:** Revert. Message: `"Auction: Already ended or not started"`.

**TC-20: Kết thúc đấu giá khi không có ai tham gia đặt giá (Edge Case)**
*   **Preconditions:** Phiên đấu giá đã quá hạn (`block.timestamp >= endTime`). Không có bất kỳ ai gọi hàm `bid` trước đó (`highestBidder` = `address(0)` và `highestBid` = 0).
*   **Steps:** Gọi hàm `endAuction(orderId)`.
*   **Expected result:** Pass. Hàm thực thi thành công chuyển trạng thái sang `Ended`. `highestBidder` vẫn là `address(0)`. Emit event `AuctionEnded(orderId, address(0), 0)`. (Lưu ý rủi ro bế tắc ở hàm `confirmDelivery` sau này vì không có user hợp lệ để xác nhận).
