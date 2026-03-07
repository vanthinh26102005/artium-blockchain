# Đánh giá chi tiết dự án Artium Blockchain

## 1. Tổng quan dự án (Project Overview)

**Artium** là một hệ thống ứng dụng web bao gồm Frontend và Backend được tổ chức dưới dạng Monorepo (đối với Backend) và một project Next.js độc lập cho Frontend. Dự án ứng dụng nhiều kỹ thuật kiến trúc phần mềm hiện đại như **Microservices**, **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS**, và **Event-Driven Architecture**.

## 2. Cấu trúc thư mục tổng thể

Thư mục gốc của dự án `artium-blockchain` chứa các thành phần chính:

- `/BE`: Toàn bộ mã nguồn Backend (NestJS Monorepo).
- `/FE/artium-web`: Toàn bộ mã nguồn Frontend (Next.js).
- `/docs`: Các tài liệu báo cáo của dự án (`report_backend`, `report_final`).

---

## 3. Kiến trúc Backend (Backend)

Backend được xây dựng theo kiến trúc **Microservices**, quản lý bằng **Yarn Workspaces**.

### 3.1. Công nghệ sử dụng:

- **Framework chính**: NestJS (TypeScript).
- **API**: Cung cấp cả GraphQL (Apollo) và REST API.
- **Cơ sở dữ liệu**: PostgreSQL và MySQL, giao tiếp qua TypeORM.
- **Message Broker & Event-Driven**: RabbitMQ xử lý giao tiếp bất đồng bộ giữa các services.
- **Caching**: Redis.
- **Xác thực & Bảo mật**: Passport.js với cơ chế JWT.

### 3.2. Cấu trúc Monorepo:

- `apps/`: Chứa mã nguồn của 10 microservices độc lập:
  - `api-gateway`: Cổng giao tiếp API trung tâm.
  - `artwork-service`: Quản lý tác phẩm nghệ thuật, thư mục và gắn thẻ.
  - `community-service`: Tính năng cộng đồng, diễn đàn thảo luận.
  - `crm-service`: Quản lý quan hệ khách hàng, tự động hóa marketing.
  - `events-service`: Quản lý sự kiện và người tham gia (RSVPs).
  - `identity-service`: Quản lý người dùng, xác thực và phân quyền.
  - `messaging-service`: Nhắn tin theo thời gian thực giữa các người dùng.
  - `notifications-service`: Hệ thống gửi thông báo.
  - `orders-service`: Quản lý quy trình thanh toán (checkout).
  - `payments-service`: Tích hợp xử lý thanh toán (sử dụng Stripe).
- `libs/`: Chứa các thư viện và module dùng chung (Shared libraries) như `rabbitmq`, `metrics`, `common`, `auth`, `outbox`.

---

## 4. Kiến trúc Frontend (Frontend)

Frontend của ứng dụng được xây dựng theo dạng Web App hiện đại, tối ưu hóa SEO và hiệu suất thông qua Server-Side Rendering (SSR).

### 4.1. Công nghệ sử dụng:

- **Framework**: Next.js 16 (sử dụng App Router).
- **Thư viện UI**: React 19.
- **Style & CSS**: Tailwind CSS v4.
- **UI Components**: Radix UI (Headless primitives) kết hợp với các mẫu thiết kế của Shadcn UI.
- **Quản lý trạng thái (State Management)**: Zustand.
- **Xử lý Form**: React Hook Form.

### 4.2. Cấu trúc thư mục Frontend (`FE/artium-web`):

- `src/app/`: Chứa các trang (pages) và bố cục (layouts) theo cơ chế App Router của Next.js.
- `src/components/`: Các UI component có thể tái sử dụng.
- `src/hooks/`: Các custom hooks của React.
- `src/store/`: Quản lý state toàn cục bằng Zustand.
- `src/lib/`: Các hàm tiện ích (utils) và cấu hình.
- `public/`: Tài nguyên tĩnh (ảnh, icon).

---

## 5. DevOps & Triển khai (Infrastructure)

### 5.1. Docker & Containerization

- Dự án sử dụng **Docker** và **Docker Compose** để thiết lập môi trường (database, RabbitMQ, Redis, ...).
- Các file cấu hình như `docker-compose.yml`, `docker-compose.isolated.yml`, `docker-compose.shared.yml` hỗ trợ việt khởi chạy linh hoạt các môi trường khác nhau.

### 5.2. Công cụ quản lý chất lượng mã nguồn

- Định dạng code: **Prettier**.
- Kiểm tra lỗi cú pháp: **ESLint**.
- Testing: Kiểm thử bằng framework **Jest** (Unit Tests, e2e Tests) có báo cáo độ phủ (Coverage).

---

## 6. Hướng dẫn khởi chạy dự án (Nhanh)

**Bước 1: Khởi tạo Backend Server**

```bash
cd BE
yarn install
# Chạy Docker để khởi tạo RabbitMQ, Redis, Database...
yarn docker:up
# Chạy tất cả microservices ở chế độ development
yarn dev:all
```

**Bước 2: Khởi tạo Frontend App**

```bash
cd FE/artium-web
npm install (hoặc yarn install)
# Tạo file .env và cấu hình URL trỏ tới BE (VD: NEXT_PUBLIC_API_URL=http://localhost:3001)
npm run dev
```

---

## 7. Tổng kết bộ mã nguồn

Dự án **Artium** là một hệ thống đồ sộ, thiết kế theo chuẩn doanh nghiệp (Enterprise-level). Việc chia nhỏ thành Microservices kết hợp với Message Queue (RabbitMQ) cho thấy hệ thống được thiết kế để chịu tải cao và dễ dàng mở rộng (Scalability). Next.js 16 và React 19 ở phía Frontend đảm bảo trải nghiệm người dùng tối ưu hóa, mượt mà và hiện đại.
