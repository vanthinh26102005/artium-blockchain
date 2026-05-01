# BÁO CÁO TRANG CHI TIẾT TRẠNG THÁI ORDER ON-CHAIN

**Ngày cập nhật:** 2026-04-25  
**Phạm vi:** `FE/artium-web`  
**Feature:** `feat-order-onchain-status-page`

---

## 1. Giới thiệu

### 1.1. Mục đích của trang
Trang `On-Chain Order Status Page` được xây dựng để hiển thị chi tiết trạng thái của một order sau khi người dùng hoàn tất thao tác bid. Đây là màn hình `read-only`, tập trung vào việc theo dõi tiến trình escrow, trạng thái đơn hàng, metadata blockchain và snapshot của artwork tại thời điểm giao dịch.

### 1.2. Vai trò của trang trong hệ thống
Trong hệ thống Artium, trang này đóng vai trò là lớp hiển thị nghiệp vụ sau bid. Nếu `Live Auction` là nơi người dùng khám phá và đặt giá, thì `On-Chain Order Status Page` là nơi người dùng kiểm tra kết quả sau khi đã có một order được ghi nhận.

### 1.3. Đối tượng sử dụng
Các nhóm người dùng chính gồm:

- Người mua hoặc nhà sưu tầm muốn kiểm tra tình trạng order sau khi bid.
- Thành viên nhóm phát triển cần demo luồng bid sang order detail.
- Giảng viên, tester hoặc stakeholder cần đối chiếu thông tin escrow và blockchain trên frontend.

---

## 2. Mục tiêu chức năng

Feature này được triển khai với các mục tiêu sau:

- Tạo một route chi tiết order theo `onChainOrderId`.
- Hiển thị đầy đủ thông tin order, escrow, artwork snapshot, shipping và lifecycle.
- Hỗ trợ `demo mode` để FE có thể demo độc lập khi backend chưa hoàn chỉnh.
- Hỗ trợ `real mode` để có thể đọc API thật khi đã có dữ liệu order thật và user đã đăng nhập.
- Nối được luồng bid demo sang trang detail nhằm tăng tính liền mạch khi trình diễn.

---

## 3. Cấu trúc triển khai

### 3.1. Route
Trang được khai báo tại route:

- `FE/artium-web/src/pages/orders/on-chain/[onChainOrderId].tsx`

Route này chịu trách nhiệm:

- Lấy `onChainOrderId` từ URL.
- Đọc query `demo=1` để xác định có chạy `demo mode` hay không.
- Truyền các tham số cần thiết xuống view chính.

### 3.2. View chính
Phần giao diện chính được triển khai tại:

- `FE/artium-web/src/@domains/orders/views/OnChainOrderDetailPageView.tsx`

View này chịu trách nhiệm:

- Quyết định nguồn dữ liệu cần dùng.
- Xử lý các state `loading`, `login required`, `error`, `not found`, `loaded`.
- Render toàn bộ bố cục chi tiết order.

### 3.3. API layer
Tầng API được mở rộng tại:

- `FE/artium-web/src/@shared/apis/orderApis.ts`

Các phần đã bổ sung gồm:

- `getOrderByOnChainId(onChainOrderId)`
- Mở rộng `OrderResponse`
- Mở rộng `OrderItemResponse`

### 3.4. Mock data cho demo
Dữ liệu demo được tổ chức tại:

- `FE/artium-web/src/@domains/orders/mock/mockOnChainOrders.ts`

Mock dataset hiện có 3 order id cố định:

- `42`
- `314`
- `9001`

Mỗi record gồm:

- `order`
- `items`

---

## 4. Hai chế độ hoạt động của trang

### 4.1. Demo mode
`Demo mode` được bật khi URL có `?demo=1`.

Khi đó:

- Trang không yêu cầu login.
- Không gọi API thật.
- Dữ liệu được lấy từ `mockOnChainOrders`.
- Nếu không tìm thấy record tương ứng, trang hiển thị `Order not found`.

### 4.2. Real mode
`Real mode` được sử dụng khi URL không có `demo=1`.

Khi đó:

- Trang yêu cầu user đã đăng nhập.
- Frontend gọi `getOrderByOnChainId(onChainOrderId)`.
- Sau khi lấy được order, frontend gọi tiếp `getOrderItems(order.id)`.
- Nếu API lỗi, giao diện hiển thị `error + retry`.
- Nếu API không tìm thấy dữ liệu, giao diện hiển thị `Order not found`.

---

## 5. Dữ liệu hiển thị trên trang

### 5.1. Header summary
Phần đầu trang hiển thị:

- `orderNumber`
- `onChainOrderId`
- `order status`
- `escrow state`
- cờ `DEMO_DATA` nếu đang ở demo mode
- ngày `Estimated Completion`

### 5.2. Artwork snapshot
Phần artwork hiển thị:

- ảnh artwork
- tên artwork
- artwork id
- mô tả snapshot
- seller label

### 5.3. On-chain verification
Phần xác thực on-chain hiển thị:

- `contractAddress`
- `txHash`
- `onChainOrderId`
- `paymentStatus`
- blockchain explorer link cho `tx` và `address`

### 5.4. Financial breakdown
Khối tài chính hiển thị:

- `subtotal`
- `shippingCost`
- `taxAmount`
- `discountAmount`
- `totalAmount`
- `highest bid reference` từ `bidAmountWei`

### 5.5. Logistics và lifecycle
Trang còn hiển thị thêm:

- `carrier`
- `trackingNumber`
- `paymentMethod`
- `destination`
- `estimatedDeliveryDate`
- `collectorId`
- `payoutStatus`
- timeline của `created`, `confirmed`, `shipped`, `dispute`, `settlement`

---

## 6. Giao diện và bố cục

Trang đã được thiết kế lại theo hướng editorial, lấy cảm hứng từ mockup designer:

- phần header summary lớn, typography mạnh
- bố cục bất đối xứng `7/5`
- artwork hero lớn ở cột trái
- financial block nền đen ở cột phải
- timeline dọc cho order lifecycle
- logistics panel riêng phía dưới

Trong quá trình triển khai, route đã được điều chỉnh để vẫn dùng `SiteHeader` và `SiteFooter` mặc định của app, giúp đồng bộ với layout chung của toàn hệ thống.

---

## 7. Luồng thao tác của người dùng

### 7.1. Luồng vào trang trực tiếp
Người dùng có thể mở trực tiếp:

- `/orders/on-chain/:onChainOrderId`

Nếu là demo:

- `/orders/on-chain/:onChainOrderId?demo=1`

### 7.2. Luồng đọc dữ liệu thật
Khi đi theo luồng thật:

1. Người dùng đăng nhập vào hệ thống.
2. Mở route chi tiết order.
3. Frontend gọi API lấy order bằng `onChainOrderId`.
4. Frontend gọi tiếp API lấy order items.
5. Giao diện render dữ liệu nhận được.

### 7.3. Luồng demo từ bid
Frontend đã nối từ `Live Auction` sang order detail demo:

1. Người dùng mở `/auction`.
2. Chọn một lot có thể bid.
3. Đi qua các trạng thái mock của bid modal.
4. Tại màn `Bid Confirmed`, bấm `View Order Status`.
5. Frontend điều hướng sang `/orders/on-chain/<demoId>?demo=1`.

Luồng này cho phép demo trải nghiệm end-to-end mà chưa cần backend bid thật.

---

## 8. Đồng bộ dữ liệu giữa Bid và Order Detail demo

Ban đầu, order detail demo chỉ đọc một mock record cố định theo `onChainOrderId`, nên artwork hiển thị trên trang detail không nhất thiết trùng với artwork mà user vừa bid.

Phiên bản hiện tại đã cải thiện theo hướng:

- vẫn dùng `mock order shell` để giữ trạng thái escrow và lifecycle
- nhưng lấy snapshot của lot vừa bid để đè lên phần detail

Cụ thể, sau khi bid được confirm, frontend truyền sang order detail các thông tin sau:

- `artworkId`
- `artworkTitle`
- `artworkImageUrl`
- `committedBidValue`
- `transactionHash`

Sau đó, ở `demo mode`, page detail sẽ merge các giá trị này vào mock record hiện có.

Kết quả:

- artwork trên detail khớp với artwork vừa bid
- giá bid hiển thị khớp với lần bid vừa confirm
- transaction hash trên detail khớp với màn xác nhận bid

Đây là cải tiến quan trọng để demo có tính thuyết phục hơn, dù phần bid backend vẫn chưa được tích hợp thật.

---

## 9. Các state giao diện đã hỗ trợ

Trang hiện hỗ trợ đầy đủ các trạng thái UI chính:

- `Loading Order`
- `Sign In Required`
- `Unable To Load`
- `Order Not Found`
- `Data Loaded`

Việc xử lý các state này giúp frontend hoạt động ổn định hơn và phản hồi rõ ràng theo từng ngữ cảnh sử dụng.

---

## 10. Các vấn đề kỹ thuật đã xử lý

### 10.1. Fix lỗi vòng lặp render
Trong quá trình triển khai, trang từng gặp lỗi:

- `Maximum update depth exceeded`

Nguyên nhân đến từ việc selector của Zustand trả về object mới ở mỗi lần render. Vấn đề này đã được xử lý bằng cách tách selector thành các selector độc lập cho `isAuthenticated` và `isHydrated`.

### 10.2. Khôi phục layout mặc định
Trang từng dùng custom full-page layout để mô phỏng sát mockup, nhưng điều này làm mất `SiteHeader`. Sau đó route đã được chỉnh lại để dùng layout mặc định của app, nhờ vậy header/footer chung đã được khôi phục.

---

## 11. Giới hạn hiện tại

Feature hiện tại vẫn còn một số giới hạn:

- Bid flow ở `Live Auction` vẫn là mock frontend, chưa phải bid thật on-chain.
- `Demo mode` vẫn dùng mock order shell cho trạng thái escrow và lifecycle.
- Chỉ phần artwork snapshot, bid amount và transaction hash được đồng bộ từ lot vừa bid.
- `Real mode` vẫn phụ thuộc backend và yêu cầu authenticated access.
- Trang hiện là `read-only`, chưa hỗ trợ thao tác như confirm delivery, release funds hoặc dispute action.

---

## 12. Kết luận

Feature `feat-order-onchain-status-page` đã hoàn thành mục tiêu chính ở frontend:

- tạo được trang chi tiết trạng thái order on-chain
- hỗ trợ cả `demo mode` và `real mode`
- hiển thị đầy đủ các thông tin quan trọng về order, escrow, blockchain và artwork
- nối được từ bid flow demo sang order detail
- cải thiện trải nghiệm demo bằng cách đồng bộ snapshot của artwork vừa bid

Đây là một bước trung gian quan trọng để nhóm có thể demo nghiệp vụ sau bid trên frontend, đồng thời giữ sẵn nền tảng để tích hợp API hoặc smart contract thật trong giai đoạn tiếp theo.
