# Kết quả Contract đối với Edge-cases, Security & Drawbacks

Báo cáo này đối chiếu lại các nguy cơ tiềm tàng được liệt kê trong file `S2_auction-edge-cases-and-drawbacks.md` với hành vi thực tế của Smart Contract `ArtAuctionEscrow`.

## 1. Các lỗi bảo mật đã được vá thành công

### Shill Bidding (Người bán tự nâng giá)

- **Trạng thái ban đầu:** Không xử lý được (Pass), ai cũng có thể bid dù là seller.
- **Hành vi hiện tại của Contract:** Đã bị chặn bằng lệnh khóa `require(msg.sender != auction.seller)`.
- **Bằng chứng:** Trong quá trình chạy Hardhat test, việc người bán tự bid sẽ ném ra (Revert) ngoại lệ bảo vệ: `"Auction: Seller cannot bid"`.

### Fake Seller Identity (Tạo đơn rác bằng ví mạo danh)

- **Trạng thái ban đầu:** Dễ bị tấn công vì Contract tin tưởng hoàn toàn biến `seller` được truyền từ tham số.
- **Hành vi hiện tại của Contract:** Hàm `createAuction` đã xóa tham số `seller` và tự gán `msg.sender`. Giới hạn chỉ có người đang dùng Private Key ký giao dịch tạo hợp đồng mới được cấp quyền làm "Người bán".
- **Bằng chứng (Terminal log sau khi đổi code sẽ bắt lỗi Error do sai tham số):**

```text
  ArtAuctionEscrow
    createAuction
           should initialize auction properly:
>      Error: no matching fragment (argument="name", value="createAuction", code=INVALID_ARGUMENT
```

(Điều này chứng minh Test cũ truyền tham số `seller.address` đã bị từ chối thẳng từ cấp ABI do hàm bảo mật đã khước từ việc truyền Custom Seller).

### Re-entrancy Attack (Tấn công tái nhập)

- **Trạng thái ban đầu:** Được ghi chú là "Đã xử lý" thông qua Checks-Effects-Interactions.
- **Hành vi hiện tại của Contract:** Giữ nguyên hiệu lực. Sử dụng `nonReentrant` trên cả hàm `bid`, `withdraw` và `confirmDelivery`. Quan trọng nhất, biến ghi nhớ số dư `$pendingReturns$` được đưa về 0 **trước khi** thực hiện lệnh `call` chuyển tiền cho Buyer. Tấn công thất bại.

## 2. Các điểm yếu chấp nhận giữ nguyên (MVP Drawbacks)

Do định hướng phát triển Smart Contract là giữ sản phẩm ở mức khả dụng tối thiểu (MVP) nhằm giảm chi phí Gas, một số trường hợp biên (Edge cases) sau đây vẫn giữ nguyên theo thiết kế gốc, và kết quả log chạy test cũng phản ánh sự thiếu vắng các kịch bản cản trở:

1.  **Chấp nhận Sniping:** Người dùng vẫn có thể Bid thành công vào giây cuối cùng. Không có cơ chế tự động +10 phút (Auto-extend) nào được kích hoạt.
2.  **Rủi ro Deadlock (Bế tắc giải ngân):**
    - Nếu không có ai Bid thành công, `auction.highestBidder` vẫn mặc định là địa chỉ `0x0000000000000000000000000000000000000000`. Hàm `confirmDelivery` gọi tham chiếu đến người thắng cuộc sẽ treo vì địa chỉ gốc không thể ký giao dịch. Tiền/Hàng hóa sẽ bị giam vĩnh viễn .
3.  **Hủy giao dịch (Cancel):** Không có bất kì hàm nào tên là `cancelAuction`. Enum `State.Cancelled` vẫn đang tồn tại như một biến "chết". Do đó không có cách khẩn cấp để ngừng giao dịch gian lận.

### Khuyến nghị: Ý tưởng chi tiết xử lý lỗi Deadlock bằng Off-chain (Backend/Cronjob)

Do chúng ta không muốn Smart Contract ôm đồm các hàm tự động đếm ngược quá phức tạp (gây tốn kém phí Gas khổng lồ), vai trò dọn dẹp các "rác" này sẽ được nhường cho Hệ thống Backend. Dưới đây là ý tưởng chi tiết:

1.  **Lắng nghe Event (Event Listener):** 
    Backend sẽ chạy một service liên tục quét (listen) các event bắn ra từ Smart Contract, đặc biệt là `AuctionEnded(orderId, winner, amount)`.
    
2.  **Tracking thời hạn chờ (DB Tracking):**
    Khi nghe thấy event `AuctionEnded` nhưng biến `winner == address(0)` (Không có ai bid) HOẶC có winner nhưng quá 7 ngày chưa thấy gọi tiếp hàm `DeliveryConfirmed`. Backend sẽ đánh dấu trạng thái của `orderId` này trong Database (ví dụ SQL/MongoDB) là `DEADLOCK_WARNING` (Cảnh báo bế tắc).

3.  **Cronjob dọn dẹp UI tự động:**
    Một tiến trình chạy ngầm (Cronjob) trên server cứ mỗi 1 tiếng sẽ quét DB 1 lần. Nếu thấy đơn nào bị `DEADLOCK_WARNING`, API sẽ:
    * Ẩn phiên đấu giá đó khỏi giao diện người dùng (Fontend/App) để không ai nhìn thấy rác nữa.
    * Gửi Email/Push Notification nhắc nhở người bán tự hủy đơn, hoặc nhắc người mua (nếu có) mau chóng bấm xác nhận.

4.  **Giải ngân khẩn cấp (Emergency Admin Action):**
    Nếu là bế tắc thật sự (Tiền bị kẹt do người mua mất tích), Admin trên trang Dashboard quản trị có thể gọi một API nội bộ. API này kích hoạt cái gọi là **Hàm Trọng Tài** trên Contract (Cần code thêm hàm `forceRefund()` hoặc `arbitrate()`). Admin sẽ cưỡng chế hoàn tiền lại cho giao dịch đang bị Deadlock để đóng băng nó hoàn toàn.
