# ArtAuctionEscrow – Edge Cases, Security & Drawbacks

## 1. Phân tích Edge-case (Trường hợp biên & cách xử lý)

| Trường hợp (Edge-case) | Trạng thái xử lý | Mô tả chi tiết & Cách khắc phục (Mitigation) |
| --- | --- | --- |
| Outbid (Bị trả giá cao hơn) | Đã xử lý (Handled) | Khi có người bid cao hơn, tiền của người cũ không gửi trả ngay (tránh DOS) mà đưa vào `pendingReturns`. Sử dụng **pull-based refund pattern** để người dùng tự gọi `withdraw`. |
| Withdraw (Rút tiền lỗi) | Đã xử lý (Handled) | Áp dụng mẫu **Checks-Effects-Interactions**: đặt số tiền chờ rút về 0 trước khi chuyển tiền bằng `.call` để chống re-entrancy. |
| Sniping (Bid phút chót) | Không xử lý (Not Handled) | `endTime` cố định; người dùng có thể bid sát giây cuối khiến người khác không kịp phản ứng. Lý do: giảm độ phức tạp và tiết kiệm gas. |
| Không có người bid | Rủi ro (Risk) | `highestBidder = address(0)`; `endAuction` vẫn chạy, nhưng không ai có thể gọi `confirmDelivery` do không có `winner` hợp lệ. |
| Hết hạn nhưng không gọi `endAuction` | Rủi ro (UX) | Nếu không ai gọi `endAuction`, phiên đấu giá ở trạng thái `Started` dù đã quá giờ; người mua không thể xác nhận nhận hàng. |
| Revert (Hành động bị từ chối) | Đã xử lý (Bảo vệ) | Contract chặn các hành động sai (bid thấp, bid sau hạn, xác nhận sai địa chỉ) bằng `require`. **Khắc phục:** frontend kiểm tra điều kiện trước khi gửi giao dịch để tránh phí gas. |
| Timeout Settlement (Bế tắc xác nhận) | Rủi ro (Deadlock) | Nếu `winner` không bao giờ gọi `confirmDelivery`, tiền bị khóa vĩnh viễn vì không có cơ chế tự động giải ngân theo thời gian. |
| Transaction Race (Đua lệnh) | Rủi ro (Kỹ thuật) | Hai người bid cùng lúc; lệnh sau `revert` vì `highestBid` đã tăng. **Khắc phục:** UI hiển thị giá real-time để người dùng điều chỉnh. |
| Tranh chấp chất lượng (Dispute) | Không xử lý (Not Handled) | Người mua nhận tranh không đúng mô tả nên không gọi `confirmDelivery`; tiền khóa, seller không được thanh toán. |
| Bế tắc xác nhận (Winner Silence) | Rủi ro (Deadlock) | Winner “mất tích” hoặc cố tình không xác nhận; chưa có cơ chế auto-release sau một khoảng thời gian. |
| Vai trò Admin (Đề xuất thêm) | Đang đề xuất (Proposed) | Thêm **Arbitrator** có thể chuyển trạng thái sang `Cancelled` (hoàn tiền) hoặc `Completed` (giải ngân cho seller). |

## 2. Bảo mật (Security Analysis)

- **Reentrancy:** Đã xử lý bằng `nonReentrant` và mô hình Checks-Effects-Interactions; `withdraw` đặt `pendingReturns` về 0 trước khi chuyển tiền.
- **Front-running:** Chưa xử lý triệt để; bid công khai có thể bị front-run. Giải pháp nâng cao (commit-reveal, sealed-bid, private relays) chưa áp dụng để giữ MVP đơn giản; hiện tại chỉ yêu cầu `msg.value > highestBid`.
- **Refund logic:** Thiếu cơ chế hoàn tiền cho winner khi seller giao sai/không giao; tiền thắng cuộc bị khóa cho đến khi có xác nhận.

## 3. Hạn chế về trải nghiệm người dùng (UX Constraints)

- **Pending transactions:** Bid sát giờ có thể được xác nhận sau `endTime` và bị `revert`, gây mất phí gas; cần hiển thị trạng thái pending rõ ràng và nhắc người dùng chờ finality.
- **User reject:** Nếu người dùng hủy ký trên ví, cần bắt lỗi để không hiển thị trạng thái “đang xử lý” giả.
- **Buyer silence:** Nếu người mua quên hoặc cố tình không bấm `confirmDelivery`, tiền seller bị khóa vĩnh viễn; hiện chưa có cơ chế can thiệp tự động.

## 4. Bảng Phân Tích Nhược Điểm (Drawbacks)

| Nhược điểm | Chi tiết kỹ thuật | Lý do không làm | Tác động / Ghi chú Demo |
| --- | --- | --- | --- |
| Không chống Sniping | `endTime` cố định; `bid` chỉ kiểm tra now < `endTime`, không gia hạn. | Tránh tăng gas/độ phức tạp cho MVP. | Người dùng có thể bị “cướp” lượt ở giây cuối, không kịp phản ứng. |
| Thiếu phân xử tranh chấp | Chỉ winner gọi `confirmDelivery`; nếu không hợp tác, tiền seller khóa. | Giữ hợp đồng đơn giản, tránh trọng tài on-chain/tập quyền. | Rủi ro bế tắc; cần arbitrator hoặc timeout settlement. |
| Không có bước nhảy giá tối thiểu | Chỉ yêu cầu `msg.value > highestBid`, có thể vượt 1 wei. | Ưu tiên rule đơn giản, chưa thiết kế tick size. | Dễ spam, giảm hiệu quả kinh tế. |
| Luồng Cancel (Hủy) chưa hoàn thiện | Enum có `State.Cancelled` nhưng chưa có hàm chuyển trạng thái. | Tránh lạm dụng hủy tùy ý khi chưa xác định role/quy trình. | Không dừng được đấu giá khi sự cố hoặc tranh chấp hàng giả. |
| Kiểm soát truy cập sơ khai | `createAuction` là `external`, chưa giới hạn caller. | Chưa tích hợp tầng auth/off-chain; ưu tiên nhanh gọn. | Có thể tạo đấu giá rác, tốn storage. |
| Seller có thể tự đấu giá | `bid` không kiểm tra `msg.sender != auction.seller`. | Tin cậy giám sát off-chain; tránh thêm check/gas ở MVP. | Seller có thể shill bid để đẩy giá. |
| Không chống Front-running | Bid công khai trên mempool, không dùng commit-reveal/private relays. | Giữ flow đơn giản, tránh phức tạp UX cho MVP. | Dễ bị front-run; cần nâng cấp nếu triển khai thật. |
| Phụ thuộc vào actor bên ngoài | Trạng thái không tự chuyển; cần gọi `endAuction` & `confirmDelivery`. | Tránh cron/on-chain automation để giảm phí/độ phức tạp. | Nếu không ai gọi, phiên đấu giá treo dù đã quá giờ. |
