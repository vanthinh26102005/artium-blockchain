# Bản phân tích quy trình nghiệp vụ của hợp đồng thông minh ArtAuctionEscrow

## 1. Các bên tham gia (Actors)
- **Seller (Người bán):** Sở hữu tác phẩm, nhận tiền sau khi quy trình hoàn tất và giao hàng được xác nhận.
- **Bidder (Người đấu giá):** Đặt giá bằng ETH; người trả cao nhất khi kết thúc sẽ thắng.
- **System/Admin (Hệ thống):** Khởi tạo phiên đấu giá từ hệ thống quản lý (off-chain) qua mã định danh đơn hàng (`orderId`).

## 2. Quy trình trạng thái (State Machine)
- **Created (Off-chain):**
  - Dữ liệu đơn hàng (`orderId`) và tác phẩm đã được khởi tạo trên hệ thống quản lý.
  - Giai đoạn chuẩn bị, chưa tương tác blockchain; smart contract chưa ghi nhận phiên đấu giá.
- **Started (On-chain):**
  - Kích hoạt ngay khi hàm `createAuction` chạy thành công.
  - Trạng thái on-chain chuyển sang `State.Started`; phiên đấu giá mở, bidder có thể đặt giá.
- **Ended (Kết thúc):**
  - Xảy ra khi thời gian đấu giá kết thúc và hàm `endAuction` được gọi.
  - Tiền của người thắng bị khóa trong hợp đồng (escrow).
- **Completed / Cancelled (On-chain):**
  - **Completed:** Người thắng xác nhận nhận hàng; tiền chuyển cho người bán.
  - **Cancelled:** Phiên đấu giá bị hủy (hiện chưa có logic hủy cụ thể).

## 3. Quy tắc nghiệp vụ (Rules)
- **`createAuction` (Tạo đấu giá):** Hệ thống tạo phiên đấu giá mới với `orderId` duy nhất, địa chỉ người bán và thời gian diễn ra; không thể tạo trùng `orderId`. Sau khi tạo thành công, trạng thái chuyển sang Started.
- **`bid` (Đặt giá):**
  - Người sau phải đặt giá cao hơn người trước; bidder mới trở thành `highestBidder`.
  - Khi có giá mới cao hơn, số tiền của `highestBidder` trước được chuyển vào "tiền chờ rút" (`pendingReturns`) để họ có thể rút.
- **`withdraw` (Rút tiền):** Người đấu giá không thành công có thể chủ động rút tiền của mình bất kỳ lúc nào; không hoàn tự động.
- **`endAuction` (Kết thúc đấu giá):** Chỉ thực hiện khi thời gian đấu giá đã hết; chốt người chiến thắng và số tiền cao nhất, hệ thống ghi nhận `winner` và `winning bid`.

## 4. Các sự kiện và dữ liệu (Events)
- **AuctionStarted:**
  - Dữ liệu: `orderId`, địa chỉ người bán (`seller`), thời gian kết thúc (`endTime`).
  - Emit khi `createAuction` thành công; đánh dấu auction mở để backend/frontend cập nhật UI.
- **NewBid:**
  - Dữ liệu: `orderId`, địa chỉ người đặt (`bidder`), số tiền đặt (`amount`).
  - Emit khi có `bid` hợp lệ mới; cập nhật `highestBidder`/`highestBid` thời gian thực.
- **AuctionEnded:**
  - Dữ liệu: `orderId`, địa chỉ người thắng (`winner`), số tiền thắng cuộc (`amount`).
  - Chốt `winner` và `winning amount`.
- **Withdrawn:**
  - Dữ liệu: địa chỉ người rút (`bidder`), số tiền rút (`amount`).
  - Thông báo người dùng rút tiền thành công.
- **DeliveryConfirmed:**
  - Thông báo người mua đã xác nhận nhận hàng và tiền đã chuyển cho người bán; backend hiểu auction đã hoàn tất thanh toán cho seller.

## 5. Giả định hệ thống
- **Mạng lưới:** Triển khai trên testnet Sepolia, phục vụ demo phát triển, không phải mainnet production.
- **Tiền tệ:** Chỉ sử dụng ETH để đặt giá và thanh toán.
- **Chống sniping:** Không áp dụng; thời gian kết thúc cố định, không tự gia hạn khi có bid phút chót.

## Một số vấn đề cần xác nhận
1. Nếu `highestBidder` không xác nhận (`confirmDelivery`): tiền bị khóa trong contract, người bán không nhận thanh toán (gọi `auction.seller.call` chỉ diễn ra trong `confirmDelivery`); trạng thái phiên đấu giá treo ở `Ended`, chưa có cơ chế tự động hoàn tiền. Giải quyết thế nào?
2. Nếu nghệ sĩ giao sai tranh: chưa có cơ chế hoàn tiền; contract chưa có vai trò admin để phân xử; trạng thái `Cancelled` chưa được mô tả rõ.
