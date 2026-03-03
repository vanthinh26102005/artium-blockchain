# 3.2. MÔ TẢ CÁC THÀNH PHẦN API (API ENDPOINTS)

Dưới đây là danh sách các API Endpoint chính được hệ thống cung cấp thông qua **API Gateway**.

## 1. Authentication & Identity Module
Quản lý định danh và phiên làm việc của người dùng.
- **POST** `/identity/auth/register/initiate`: Gửi OTP đăng ký tài khoản.
- **POST** `/identity/auth/register/complete`: Xác thực OTP và tạo tài khoản.
- **POST** `/identity/auth/login`: Đăng nhập bằng Email/Password.
- **POST** `/identity/auth/google`: Đăng nhập bằng Google ID Token.
- **GET** `/identity/users/me`: Lấy thông tin Profile của user hiện tại (Protected).
- **POST** `/identity/auth/password/reset/request`: Yêu cầu reset mật khẩu.
- **PUT** `/identity/auth/password/reset/confirm`: Đặt lại mật khẩu mới.

## 2. Artwork & Inventory Module
Quản lý tác phẩm nghệ thuật và kho hàng.
- **GET** `/artwork`: Lấy danh sách tác phẩm (Filter, Search, Pagination).
- **POST** `/artwork`: Tạo mới tác phẩm (Upload).
- **GET** `/artwork/:id`: Xem chi tiết tác phẩm.
- **PUT** `/artwork/:id`: Cập nhật thông tin tác phẩm.
- **DELETE** `/artwork/:id`: Xóa tác phẩm.
- **POST** `/artwork/folders`: Tạo thư mục quản lý (Inventory Folder).
- **POST** `/artwork/tags`: Quản lý thẻ (Tags).

## 3. Orders & Cart Module (E-commerce)
Quy trình mua sắm tiêu chuẩn.
- **POST** `/orders`: Tạo đơn hàng mới.
- **GET** `/orders/:id`: Xem chi tiết đơn hàng.
- **GET** `/orders/my-orders`: Xem lịch sử đơn hàng của User.
- **POST** `/cart/add`: Thêm sản phẩm vào giỏ hàng.
- **DELETE** `/cart/remove`: Xóa sản phẩm khỏi giỏ.

## 4. Payments & Invoices Module (Quick Sell)
Tính năng bán hàng nhanh cho nghệ sĩ.
- **POST** `/payment/invoices`: Tạo hóa đơn bán hàng (Quick Sell Invoice).
- **GET** `/payment/invoices/:code`: Lấy thông tin hóa đơn theo mã (cho trang Checkout).
- **POST** `/payment/create-intent`: Tạo Payment Intent (Stripe) để xử lý thanh toán.
- **GET** `/payment/payouts`: Xem lịch sử rút tiền về tài khoản ngân hàng.

## 5. Messaging Module
Hệ thống tin nhắn nội bộ.
- **GET** `/messaging/conversations`: Lấy danh sách cuộc trò chuyện.
- **POST** `/messaging/messages`: Gửi tin nhắn mới.
- **GET** `/messaging/messages/:conversationId`: Lấy lịch sử tin nhắn.
- **POST** `/messaging/upload`: Gửi ảnh/file trong tin nhắn.

## 6. Notifications Module
- **GET** `/notifications`: Lấy danh sách thông báo.
- **PUT** `/notifications/read/:id`: Đánh dấu đã đọc.
