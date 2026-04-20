# ĐẶC TẢ CHỨC NĂNG BID MODAL/PANEL

**Ngày cập nhật:** 2026-04-15  
**Phạm vi:** `FE/artium-web`  
**Màn hình liên quan:** `Live Auction`, `Artwork Detail`  
**Mục tiêu:** Chuẩn hóa nghiệp vụ và trạng thái giao diện cho modal/panel đặt giá trước khi triển khai thiết kế và tích hợp logic thật.

---

## 1. Giới thiệu

### 1.1. Mục đích của tài liệu
Tài liệu này mô tả đặc tả nghiệp vụ và yêu cầu giao diện cho chức năng `Bid Modal/Panel` trong hệ thống Artium. Mục tiêu là tạo ra một chuẩn chung để nhóm thiết kế và frontend có thể làm việc đồng nhất trước khi tích hợp API hoặc smart contract thật.

### 1.2. Phạm vi áp dụng
Chức năng này được áp dụng cho:

- Nút `Place Bid` tại trang `Live Auction`.
- Khả năng tái sử dụng ở trang chi tiết tác phẩm `Artwork Detail` trong giai đoạn sau.

Tài liệu này tập trung vào:

- Trạng thái nghiệp vụ của thao tác đặt giá.
- Luồng thao tác người dùng.
- Dữ liệu hiển thị trên UI.
- Quy tắc validate cơ bản.
- Các màn hình cần được thiết kế.

### 1.3. Phạm vi chưa bao gồm
Phiên bản đặc tả hiện tại chưa bao gồm:

- Realtime update nhiều người dùng cùng đặt giá.
- Lịch sử bid chi tiết.
- Đồng bộ blockchain thật, transaction hash thật, hoặc wallet flow hoàn chỉnh.
- Các yêu cầu backend chi tiết về persistence hoặc event stream.

---

## 2. Mục tiêu chức năng

Chức năng `Bid Modal/Panel` cần hỗ trợ các mục tiêu sau:

- Cho phép người dùng xem nhanh thông tin phiên đấu giá đang diễn ra.
- Cho phép nhập một mức giá mới hợp lệ.
- Hiển thị rõ tiến trình xử lý bid theo từng trạng thái.
- Phản hồi rõ ràng khi bid thành công hoặc thất bại.
- Dễ mở rộng từ mock flow sang call API hoặc smart contract thật.

---

## 3. Đối tượng sử dụng

Các nhóm người dùng chính gồm:

- Người mua hoặc nhà sưu tầm muốn đặt giá cho một tác phẩm đang đấu giá.
- Người dùng đang theo dõi `Live Auction` và muốn thao tác nhanh trực tiếp trên danh sách.
- Thành viên nhóm phát triển và thiết kế cần một chuẩn chung để triển khai giao diện.

---

## 4. Entry points của chức năng

### 4.1. Từ trang Live Auction
Người dùng bấm nút `Place Bid` trên card hoặc list item của một auction lot.

### 4.2. Từ trang Artwork Detail
Trong tương lai, cùng một modal/panel có thể được tái sử dụng ở trang chi tiết tác phẩm để tránh lặp lại logic và trạng thái UI.

---

## 5. Hai lớp trạng thái cần phân biệt

Khi thiết kế và triển khai, cần tách rõ hai lớp trạng thái sau.

### 5.1. Trạng thái của phiên đấu giá
Đây là trạng thái nghiệp vụ của auction lot:

- `active`
- `ending-soon`
- `paused`
- `closed`

### 5.2. Trạng thái của thao tác đặt giá
Đây là trạng thái của bid flow trong modal:

- `editing`
- `submitting`
- `pending`
- `confirmed`
- `failed`

### 5.3. Ý nghĩa của việc tách hai lớp trạng thái
Việc phân biệt hai lớp trạng thái giúp:

- Tránh nhầm lẫn giữa trạng thái auction và trạng thái submit bid.
- Thiết kế UI rõ ràng hơn theo từng ngữ cảnh.
- Dễ mở rộng logic sau này khi tích hợp smart contract hoặc backend.

---

## 6. Điều kiện mở modal

Modal/panel đặt giá chỉ được phép mở khi auction đang ở trạng thái:

- `active`
- `ending-soon`

Modal không mở luồng đặt giá khi auction ở trạng thái:

- `paused`
- `closed`

Trong các trường hợp không thể đặt giá:

- `paused`: CTA nên chuyển sang hành động như `View Artwork`.
- `closed`: CTA nên chuyển sang hành động như `View Results`.

---

## 7. Dữ liệu cần hiển thị trong Bid Modal/Panel

### 7.1. Phần header

- Tiêu đề: `Place a Bid`
- Tên tác phẩm
- Nút đóng modal

### 7.2. Phần body

- Ảnh thumbnail của tác phẩm
- Current bid
- Minimum next bid
- Auction status
- Time remaining
- Input `Your bid`
- Inline validation hoặc helper text

### 7.3. Phần footer

- CTA chính: `Place Bid`
- CTA phụ: `Cancel` hoặc `Close`
- Ghi chú nhỏ nếu cần, ví dụ điều khoản hoặc note về việc bid là hành vi cam kết

### 7.4. Quy tắc hiển thị time remaining
Để tối ưu khả năng đọc và tạo cảm giác khẩn trương đúng lúc, phần `Time remaining` nên hiển thị theo các mốc sau:

- Nếu thời gian còn lại lớn hơn `24 giờ`, hiển thị dạng rút gọn như `2d remaining`.
- Nếu thời gian còn lại lớn hơn `60 phút` và nhỏ hơn hoặc bằng `24 giờ`, hiển thị dạng `12h remaining`.
- Nếu thời gian còn lại nhỏ hơn hoặc bằng `60 phút`, chuyển sang countdown realtime dạng `HH:MM:SS`.
- Nếu thời gian còn lại nhỏ hơn hoặc bằng `10 phút`, countdown cần được nhấn mạnh bằng màu đỏ hoặc hiệu ứng pulse.
- Nếu thời gian còn lại nhỏ hơn hoặc bằng `1 phút`, vẫn giữ countdown nhưng tăng mức nhấn mạnh cao nhất trong giao diện.

Ý nghĩa:

- Giai đoạn còn nhiều thời gian ưu tiên đọc nhanh.
- Giai đoạn cuối ưu tiên cảm giác khẩn trương và hỗ trợ ra quyết định nhanh.

---

## 8. Quy tắc nghiệp vụ cơ bản

### 8.1. Quy tắc nhập giá

- Người dùng phải nhập một giá trị số hợp lệ.
- Bid phải lớn hơn `current bid`.
- Bid phải lớn hơn hoặc bằng `minimum next bid`.
- Không cho submit khi input rỗng.
- Không cho submit khi input sai định dạng.

### 8.2. Mức giá tối thiểu tiếp theo
Đề xuất công thức:

`minimum next bid = current bid + minimum increment`

Ví dụ:

- `current bid = 2.3 ETH`
- `minimum increment = 0.1 ETH`
- `minimum next bid = 2.4 ETH`

### 8.3. Các điều kiện có thể chặn bid
Tùy theo giai đoạn phát triển hệ thống, modal cần chừa chỗ cho các điều kiện chặn sau:

- Người dùng chưa đăng nhập.
- Người dùng chưa connect wallet.
- Người dùng chưa đủ điều kiện xác minh nếu hệ thống yêu cầu.
- Auction vừa kết thúc trong lúc modal đang mở.
- Giá hiện tại đã thay đổi do có người bid trước.

---

## 9. Luồng nghiệp vụ tổng quát

Quy trình thao tác chuẩn gồm các bước sau:

1. Người dùng bấm `Place Bid`.
2. Hệ thống mở modal ở trạng thái `editing`.
3. Người dùng nhập giá bid.
4. Hệ thống validate giá trị nhập.
5. Người dùng bấm `Place Bid`.
6. Modal chuyển sang trạng thái `submitting`.
7. Nếu request gửi thành công, modal chuyển sang `pending`.
8. Nếu xác nhận thành công, modal chuyển sang `confirmed`.
9. Nếu xảy ra lỗi, modal chuyển sang `failed`.

---

## 10. Đặc tả chi tiết theo từng trạng thái UI

### 10.1. Trạng thái `editing`
Đây là trạng thái mặc định khi modal vừa mở.

Yêu cầu hiển thị:

- Hiển thị đầy đủ thông tin auction.
- Hiển thị input nhập bid.
- Hiển thị `current bid` và `minimum next bid`.
- Hiển thị `time remaining` theo đúng rule phân tầng ngày, giờ và countdown realtime.
- Hiển thị helper text để hướng dẫn người dùng.
- CTA `Place Bid` chỉ bật khi giá trị hợp lệ.

Yêu cầu UX:

- Nếu nhập giá không hợp lệ, hiển thị lỗi inline ngay dưới input.
- Với auction `ending-soon`, countdown cần được cập nhật realtime.
- Với mốc `10 phút` và `1 phút`, UI cần tăng nhấn mạnh thị giác cho vùng thời gian.
- Có thể bổ sung các shortcut như `Use minimum`, `+0.1 ETH`, `+0.5 ETH` nếu team thiết kế muốn tăng tốc thao tác.

### 10.2. Trạng thái `submitting`
Đây là trạng thái khi người dùng vừa submit bid và hệ thống đang gửi request.

Yêu cầu hiển thị:

- Disable toàn bộ input.
- Disable CTA chính để tránh submit nhiều lần.
- Hiển thị spinner hoặc loading indicator.
- Hiển thị message như `Submitting your bid...`

Mục tiêu UX:

- Giảm cảm giác mơ hồ khi người dùng vừa thao tác.
- Ngăn hiện tượng bấm nhiều lần gây trùng request.

### 10.3. Trạng thái `pending`
Đây là trạng thái khi request đã được gửi đi nhưng hệ thống vẫn đang chờ xác nhận.

Yêu cầu hiển thị:

- Khóa form nhập hoặc chuyển hoàn toàn sang status view.
- Hiển thị message như `Your bid is pending confirmation`.
- Hiển thị mức giá vừa submit.
- Có thể hiển thị timestamp hoặc transaction id/hash rút gọn ở giai đoạn sau.

Yêu cầu UX:

- Người dùng được phép đóng modal ở trạng thái này.
- Hệ thống cần chừa khả năng để người dùng quay lại xem trạng thái sau.

### 10.4. Trạng thái `confirmed`
Đây là trạng thái bid đã được xác nhận thành công.

Yêu cầu hiển thị:

- Thông báo thành công rõ ràng.
- Hiển thị bid đã được chấp nhận.
- Có thể hiển thị `New highest bid` nếu phù hợp với dữ liệu thật.

CTA đề xuất:

- `Done`
- `Close`
- `View Artwork`

### 10.5. Trạng thái `failed`
Đây là trạng thái bid không hoàn thành.

Yêu cầu hiển thị:

- Hiển thị thông báo lỗi rõ ràng.
- Hiển thị lý do thất bại nếu có.
- Giữ lại mức giá người dùng đã nhập để dễ thử lại.

CTA đề xuất:

- `Try Again`
- `Close`

---

## 11. Danh sách lỗi cần hỗ trợ trên UI

Các lỗi chính cần được hỗ trợ trong thiết kế và frontend gồm:

- Giá bid thấp hơn `minimum next bid`.
- Auction đã kết thúc trong lúc người dùng đang thao tác.
- Có bidder khác vừa đặt mức giá cao hơn trước đó.
- Lỗi mạng hoặc lỗi gửi giao dịch.
- Người dùng không đủ điều kiện để bid.

Ví dụ nội dung lỗi:

- `Your bid must be at least 2.4 ETH`
- `This auction has already ended`
- `Another bidder has placed a higher bid`
- `We could not submit your bid. Please try again`

---

## 12. Yêu cầu thiết kế giao diện

### 12.1. Trên desktop

- Có thể dùng modal ở giữa màn hình hoặc side panel.
- Cần thể hiện rõ ba vùng: header, body, footer.
- Trạng thái `pending`, `confirmed`, `failed` cần có visual khác biệt rõ ràng với `editing`.

### 12.2. Trên mobile

- Ưu tiên bottom sheet hoặc full-screen modal.
- Khu vực CTA cần đủ lớn để thao tác bằng tay.
- Cần đảm bảo input và message trạng thái không bị che khi mở bàn phím.

### 12.3. Cấu trúc giao diện đề xuất

- Header:
  - Tên modal
  - Tên artwork
  - Nút đóng
- Body:
  - Ảnh tác phẩm
  - Current bid
  - Minimum next bid
  - Time remaining
  - Input bid
  - Validation hoặc status message
- Footer:
  - CTA chính
  - CTA phụ
  - Note nhỏ nếu cần

---

## 13. Yêu cầu UX và hành vi tương tác

- CTA `Place Bid` phải disabled khi form chưa hợp lệ.
- Loading state phải rõ ràng để tránh người dùng bấm nhiều lần.
- Khi bid `pending`, người dùng vẫn có thể đóng modal.
- Khi `failed`, hệ thống nên giữ lại input cũ để người dùng retry.
- Nếu giá hiện tại thay đổi trong lúc modal đang mở, UI cần có khả năng báo lại cho người dùng và yêu cầu nhập mức mới.

---

## 14. Deliverable cho thiết kế

Designer cần chuẩn bị tối thiểu các màn hình sau:

- `editing`
- `submitting`
- `pending`
- `confirmed`
- `failed`

Ngoài ra nên có:

- 1 biến thể desktop
- 1 biến thể mobile
- 1 biến thể lỗi input
- 1 biến thể khi auction không còn hợp lệ trong lúc modal đang mở

---

## 15. Phân kỳ triển khai đề xuất

### 15.1. Phase 1

- Thiết kế đầy đủ 5 trạng thái UI.
- Dùng dữ liệu mock.
- Chưa cần realtime.
- Chưa cần blockchain thật.

### 15.2. Phase 2

- Tích hợp API hoặc smart contract.
- Bổ sung trạng thái xác nhận thực tế.
- Hiển thị transaction hash hoặc identifier nếu cần.
- Đồng bộ current bid thật và thời gian còn lại thật.

---

## 16. Kết luận

`Bid Modal/Panel` là thành phần quan trọng để chuyển trang `Live Auction` từ một màn hình trưng bày sang một luồng thao tác đấu giá thực sự. Việc chốt đặc tả nghiệp vụ và trạng thái UI ngay từ đầu giúp giảm sai lệch giữa thiết kế và frontend, đồng thời tạo nền tảng tốt để tích hợp backend hoặc smart contract ở giai đoạn sau.
