# Chi tiết Review Pull Request: Nhánh `feat-implement-solidity`

Pull Request (PR) này tập trung vào việc hiện thực hóa tài liệu thiết kế nghiệp vụ (business logic) của hệ thống Đấu giá Nghệ thuật (ArtAuction) thông qua Smart Contract viết bằng ngôn ngữ Solidity. Dưới đây là phần giải thích và review chi tiết về những gì người bạn của bạn đã triển khai trên nhánh `feat-implement-solidity`.

## 1. Cấu trúc và Kiến trúc chung
- **File chính:** `smart-contracts/contracts/ArtAuctionEscrow.sol`.
- **Thư viện:** Khéo léo kế thừa từ thư viện chuẩn bảo mật OpenZeppelin (`ReentrancyGuard.sol`) nhằm ngăn chặn triệt để tấn công Re-entrancy ở các hàm liên quan đến chuyển tiền.
- **Trạng thái:** Quản lý vòng đời hợp đồng rõ ràng thông qua `enum State { Started, Ended, Completed, Cancelled }`.

## 2. Các Cấu trúc dữ liệu cốt lõi (Data Structures)
- **`struct Auction`:** Cấu trúc chứa toàn bộ thông tin của mỗi phiên đấu giá: 
  - `seller` (người tạo/người bán)
  - `highestBidder` (người trả giá cao nhất hiện tại)
  - `highestBid` (mức giá cao nhất đang được ghi nhận)
  - `endTime` (thời điểm chốt số)
  - `state` (trạng thái vòng đời)
- **`mapping auctions`:** Lưu trữ toàn bộ các phiên đấu giá toàn hệ thống đi kèm với một khoá `orderId` (chuỗi string duy nhất). Định hướng mapping này rất phù hợp với luồng backend (tạo/tìm ID).
- **`mapping pendingReturns`:** Đóng vai trò là số cái (ledger) theo dõi số dư của những người đã bị Outbid, tuân thủ đúng định hướng Push-over-Pull (để user chủ động xả tiền ra thay vì loop qua mảng hoàn trả rất rủi ro tốn Gas).

## 3. Các hàm chính (Core Functions)

### `createAuction(string orderId, address seller, uint256 duration)`
- Khởi tạo đầy đủ thông tin vào struct `Auction`.
- **Check (Kỳ vọng):** Đã `require` giới hạn thời hạn phải nằm trong mốc tương lai hợp lệ `endTime > block.timestamp`.
- Ép tính duy nhất cho `orderId` thông qua `require(auctions[orderId].seller == address(0))`.

### `bid(string orderId)`
- Nhận Ether (`payable`) cho mỗi lần đặt giá.
- **Check:** `msg.value > auction.highestBid` - bắt buộc bid sau phải nhiều tiền hơn bid trước.
- **Check thời gian:** `block.timestamp < auction.endTime` - chặn mọi hành vi bid muộn.
- Cập nhật tự động phần tiền hoàn lại (refund tracking) cho người tham gia đặt giá liền kề trước đó vào `pendingReturns`. 

### `withdraw()`
- User chủ động tự rút tiền của mình bị giam nếu đấu giá thất bại.
- **Security Check:** Hoàn toàn tuân thủ **Checks-Effects-Interactions** khi biến `pendingReturns[msg.sender] = 0;` (Xoá số dư trước tiên) sau đó mới đẩy lệnh `.call{value: amount}("")` để chuyển Ether về ví.
- Bọc thêm modifier `nonReentrant` của OpenZeppelin.

### `endAuction(string orderId)`
- User hay backend có quyền gọi hàm này để kết thúc vòng đời của việc Bid (khép lại phiên đấu giá), đặt `state` trở thành `Ended`.
- Chỉ thực hiện được sau khi `endTime` đã khép lại.

### `confirmDelivery(string orderId)` (Bổ sung thêm)
- Hàm rất thông minh để chốt Escrow (xác nhận giao hàng thủ công). Hàm cho phép winner xác nhận đã nhận sản phẩm thực, lúc đó hợp đồng mới mở khóa và bắn số dư `highestBid` vào ví `seller`.

## 4. Đặc tả Events
Các Event đã được định danh và lưu theo format vô cùng chuẩn chỉ, giúp việc lắng nghe (listen) thông báo của Backend / Subgraph rất dễ dàng qua `emit`:
- `AuctionStarted`: Báo hiệu bắt đầu phiên.
- `NewBid`: Báo hiệu có dòng tiền đổ vào kèm ID phiên.
- `AuctionEnded`: Báo hiệu tìm ra người thắng cuộc và ngừng nhận bid.
- `Withdrawn`: Logging giao dịch rút tiền.
- `DeliveryConfirmed`: Hoàn thành quy trình Escrow.

## 5. Chuẩn hoá Thông báo Revert (Revert Messages)
Tất cả các câu lệnh `require` không thành công đều được gán nhãn tiền tố: `"Auction: [Nội dung lỗi chi tiết]"`.  (Ví dụ: `"Auction: Bid too low"` hoặc `"Auction: Already ended"`). 
Điều này mang lại ưu điểm cực lớn giúp Frontend và nhóm Backend có thể dễ phân parse chuỗi JSON nhằm hiển thị Toast Error tốt hơn trên giao diện.

## 6. Sửa lỗi dư thừa / Rác Code (Đã tự động fix)
PR gốc đã bị đẩy lên sai các tham chiếu thư viện rác (Thư mục `node_modules/`, `artifacts/`, `cache/` khoảng trên 19,000 files/hơn 3 triệu dòng code). 
**Hành động sửa đổi:** Đã bổ sung file `.gitignore` để cách ly các folder này giúp PR chỉ còn gọn gàng gồm thiết lập package và file code `.sol` gốc.

---

> **Đánh giá chung:** Người làm task này (Việt Đức) đã Code một Smart Contract (ArtAuctionEscrow.sol) hoàn thiện cực kỳ tốt, bao phủ được hầu hết Business Logic cần thiết, và thiết kế bảo mật khá chặt chẽ với phương thức Pull Payments hạn chế tấn công. Chỉ trừ lỗi vô tình bỏ quên `.gitignore` đã được fix, bản PR này **xứng đáng được Approve và Merge**.
