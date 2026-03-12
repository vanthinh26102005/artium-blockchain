# Tổng quan dự án Artium (artium-blockchain)

Dự án Artium là một nền tảng Web Application (được đánh dấu là đồ án SE347 - Group 16 và cũng liên quan tới IE213-Blockchain). 
Dự án được xây dựng với quy mô lớn, áp dụng kiến trúc Microservices ở Backend và giao diện hiện đại ở Frontend.

Dưới đây là thống kê chi tiết về những thành phần mà dự án hiện đang có:

## 1. Kiến trúc Hệ thống (System Architecture)
Hệ thống được chia làm 2 phần chính:
- **Backend (BE):** Chạy trên kiến trúc **Microservices** phân tán. Được thiết kế theo chuẩn **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS** (Command Query Responsibility Segregation) và **Event-Driven Architecture** (Kiến trúc hướng sự kiện).
- **Frontend (FE):** Xây dựng dưới dạng Single Page Application kết hợp SSR/SSG thông qua **Next.js** (Pages Router).

## 2. Frontend (FE/artium-web)
Nằm tại thư mục `FE/artium-web`, đây là một ứng dụng ứng dụng Next.js quy mô với các công nghệ và tính năng chính:

**Công nghệ sử dụng:**
- **Core:** Next.js 16.1 (Pages Router), React 19, TypeScript.
- **Styling & UI:** Tailwind CSS v4, Radix UI (các UI primitives không head), framer-motion/tailwindcss-animate.
- **State Management:** Zustand.
- **Khác:** Next Auth (Xác thực), Stripe (Thanh toán), Socket.io-client (Realtime).

**Các trang/Tính năng chính đã được implement (trong thư mục `src/pages`):**
- **Trang chủ & Khám phá:** `homepage`, `discover`, `editorial` (tạp chí nghệ thuật), `events` (sự kiện).
- **Thương mại/Sản phẩm:** `artworks` (tác phẩm), `portfolio`, `inventory` (quản lý kho), `checkout` (thanh toán).
- **Quản lý Nghệ sĩ & CRM:** `artist-management` (quản lý đội ngũ nghệ sĩ), `contact-management` (quản lý liên hệ), `sales` / `promotions` / `refer-and-earn`.
- **Tương tác:** `messages` (hệ thống tin nhắn), `private-views` (chế độ xem riêng tư).
- **Người dùng:** `login`, `sign-up`, `profile`, `pricing`, `manage-plan`, `reset-password`.

## 3. Backend (BE)
Nằm tại thư mục `BE`, là một NestJS monorepo chứa nhiều microservices và thư viện dùng chung.

**Công nghệ sử dụng:**
- **Framework:** NestJS, TypeScript, GraphQL & REST.
- **Cơ sở dữ liệu:** PostgreSQL, MySQL, Redis (Cache).
- **Message Broker:** RabbitMQ (@golevelup/nestjs-rabbitmq) để giao tiếp giữa các services qua Events.
- **ORM:** TypeORM.
- **Dịch vụ bên ngoài:** Firebase Admin, Google Cloud Storage, Cloudinary, Stripe, PayOS.

**Các Microservices hiện đang có (`BE/apps/`):**
1. `api-gateway`: Cổng giao tiếp API tổng, định tuyến request đến các services phù hợp.
2. `artwork-service`: Quản lý các tác phẩm nghệ thuật.
3. `community-service`: Quản lý các tính năng cộng đồng, tương tác.
4. `crm-service`: Quản lý quan hệ khách hàng (Customer Relationship Management).
5. `events-service`: Quản lý sự kiện.
6. `identity-service`: Dịch vụ định danh, xác thực và phân quyền người dùng.
7. `messaging-service`: Dịch vụ tin nhắn/chat qua Socket.io.
8. `notifications-service`: Dịch vụ gửi thông báo (Email/Push).
9. `orders-service`: Dịch vụ quản lý đơn hàng.
10. `payments-service`: Dịch vụ thanh toán (Tích hợp Stripe & PayOS).

**Các thư viện dùng chung (Libs):**
- `api-clients`, `auth`, `common`, `metrics`, `outbox` (Outbox pattern), `rabbitmq`.

## 4. Cơ sở hạ tầng & DevOps (Infrastructure)
Dự án được setup sẵn để chạy trong môi trường container rạch ròi:
- Cấu hình qua **Docker Compose** (`docker-compose.yml`, `docker-compose.isolated.yml`, `docker-compose.shared.yml`).
- Tích hợp **Skaffold** (`skaffold.yaml`) hỗ trợ CI/CD và local Kubernetes dev.
- Các script chạy đồng thời qua `concurrently`.

## 5. Các logic/nghiệp vụ đặc thù (Custom Rules)
- Tích hợp thanh toán linh hoạt bằng mã QR qua **PayOS**. 
- Thay vì dùng tool verify sẵn của SDK PayOS, hệ thống tự triển khai manual verify (Sử dụng hàm tự định nghĩa: `sortObjDataByKey`, `convertObjToQueryStr`, `isValidData` cùng thuật toán `HMAC-SHA256`) để linh hoạt khớp với dữ liệu test từ PayOS Dashboard.
- Tạo mới tính năng Quick Sell Invoice và Inspire Tab Avatar.

---
*Tóm lại, hiện tại Artium là một dự án thương mại điện tử chuyên biệt (có thể dành cho nghệ thuật/tác phẩm NFT hoặc gắn liền với web3/blockchain như tên gọi) với độ hoàn thiện cao ở mặt kiến trúc phân tán ở Backend và giao diện phức tạp ở Frontend.*
