# 3.3. QUY TRÌNH XÁC THỰC (AUTH FLOW)

Hệ thống sử dụng cơ chế xác thực dựa trên **JWT (JSON Web Token)** kết hợp với **Refresh Token** để đảm bảo bảo mật và trải nghiệm người dùng liền mạch.

## 1. Cơ chế Đăng nhập (Login Strategy)
Hệ thống hỗ trợ 2 phương thức đăng nhập chính:

### A. Đăng nhập Email/Password
1. Client gửi `email` và `password` lên `/auth/login`.
2. **API Gateway** chuyển tiếp request tới **Identity Service**.
3. **Identity Service**:
   - Tìm user trong DB.
   - So khớp mật khẩu (đã băm bằng bcrypt).
   - Nếu đúng: Tạo cặp `AccessToken` (ngắn hạn) và `RefreshToken` (dài hạn).
   - Lưu `RefreshToken` vào bảng `refresh_tokens` trong DB.
4. Trả về Client: User Info + Tokens.

### B. Đăng nhập Google (OAuth2)
1. Client (Frontend) thực hiện đăng nhập với Google, nhận về `idToken`.
2. Client gửi `idToken` lên `/auth/google`.
3. **Identity Service**:
   - Verify `idToken` với Google Server (sử dụng `google-auth-library`).
   - Lấy email từ token payload.
   - Nếu user chưa tồn tại -> Tự động đăng ký (hoặc yêu cầu xác nhận).
   - Nếu tồn tại -> Thực hiện quy trình cấp Token như trên.

## 2. Quy trình Đăng ký (2-Step Verification)
Để tránh spam account, quy trình đăng ký yêu cầu xác thực Email OTP:

- **Bước 1 (Initiate)**:
  - User nhập Email + Password.
  - Server tạo mã OTP (6 số), lưu tạm (Redis/Cache) và gửi Email cho user.
- **Bước 2 (Complete)**:
  - User nhập mã OTP.
  - Server kiểm tra OTP.
  - Nếu đúng: Tạo User mới trong DB -> Cấp Token -> Login thành công.

## 3. Bảo mật & Session
- **Access Token**: Có thời hạn ngắn (ví dụ: 15 phút - 1 giờ). Dùng để gọi các API được bảo vệ (`Bearer Token`).
- **Refresh Token**: Có thời hạn dài (ví dụ: 7 - 30 ngày). Dùng để lấy Access Token mới khi cái cũ hết hạn mà không cần user đăng nhập lại.
- **Logout**: Xóa Refresh Token trong DB, vô hiệu hóa phiên làm việc.
