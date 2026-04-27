# Smart Contracts Description

Trong thư mục `smart-contracts` này, hiện tại chứa hợp đồng thông minh lõi của hệ thống để quản lý các chức năng liên quan đến đấu giá và giao dịch tác phẩm nghệ thuật vật lý (physical art).

## Danh sách Smart Contracts

### 1. `ArtAuctionEscrow.sol`

Hợp đồng này đóng vai trò quản lý vòng đời của một phiên đấu giá và giữ tiền đảm bảo (escrow) trong lúc giao dịch diễn ra giữa người bán và người mua. Nó cung cấp sự an toàn và hạn chế rủi ro trong kiến trúc lai (hybrid architecture), kết hợp giữa hệ thống off-chain và on-chain.

#### Các chức năng và cách thức hoạt động chính:

- **`createAuction` (Khởi tạo phiên đấu giá):**
  Hệ thống off-chain thông qua backend sẽ gọi hàm này để mở một phiên đấu giá. Hàm tiếp nhận `orderId` (mã giao dịch do backend quản lý), địa chỉ ví người bán (`seller`) và thời gian có hiệu lực (`duration`). Khi gọi, hạn chót đấu giá (`endTime`) sẽ được tính bằng timestamp hiện tại cộng với khoảng thời gian tổ chức.
- **`bid` (Tham gia đặt giá):**
  Cho phép người tham gia gửi tiền mã hoá vào hợp đồng (qua `msg.value`) để đặt giá mua tác phẩm nghệ thuật. Hàm kiểm tra gắt gao tình trạng phiên đấu giá (còn thời hạn, trạng thái đang mở). Người gửi mức giá cao nhất gần nhất sẽ trở thành `highestBidder`. Những người bị trả giá vượt lệnh (outbid) sẽ có số dư tiền trả lại ghi nhận trong sổ cái `pendingReturns`.
- **`withdraw` (Rút lại tiền):**
  Triển khai mô hình Rút tiền Chủ động (Pull over Push) theo mẫu Checks-Effects-Interactions giúp chống lại các cuộc tấn công tái thâm nhập (Reentrancy attack). Bất kỳ ai từng đặt giá nhưng bị vượt mặt bởi tài khoản khác có thể chủ động gọi hàm `withdraw` để rút số dư trong `pendingReturns` của mình về ví.
- **`endAuction` (Kết thúc phiên đấu giá):**
  Hệ thống hoặc bất kỳ ai có thể gọi hàm sau khi `endTime` đã thiết lập ở `createAuction` trôi qua. Hàm này thay đổi trạng thái của phiên đấu giá thành `Ended`. Tiền của người thắng cuộc sẽ được khoá lại theo vai trò escrow (bên trung gian giữ tiền cho đến khi giao hàng hoàn tất).
- **`confirmDelivery` (Xác nhận nhận hàng):**
  Sau khi người bán vận chuyển và người thắng cuộc (highest bidder) nhận được sản phẩm vật lý, người nhận sẽ gọi hàm này để xác nhận hàng đã đến tay. Toàn bộ tiền giữ tại escrow sẽ được tự động giải phóng và chuyển thẳng cho người bán. Vòng đời giao dịch hoàn tất với trạng thái `Completed`.
