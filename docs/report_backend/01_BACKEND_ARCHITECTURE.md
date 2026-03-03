# 3.1. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống Backend của Artium được xây dựng theo kiến trúc **Microservices**, sử dụng **NestJS** làm framework chính và quản lý dưới dạng **Monorepo** (Nx style).

## 1. Mô hình Tổng quan
Hệ thống bao gồm các thành phần chính sau:

1.  **API Gateway**:
    - Đóng vai trò là điểm truy cập duy nhất (Entry Point) cho toàn bộ Client (Web, Mobile).
    - Nhiệm vụ: Routing request, Authentication (Guard), Rate limiting, và Aggregation dữ liệu.
    - Giao tiếp với các Microservices phía sau thông qua giao thức **TCP (RPC)** để đảm bảo hiệu năng thấp (low latency).

2.  **Microservices Ecosystem**:
    Các dịch vụ được tách biệt theo nghiệp vụ (Domain-Driven Design):
    - **Identity Service**: Quản lý người dùng, xác thực (Auth), hồ sơ nghệ sĩ (Seller Profile).
    - **Artwork Service**: Quản lý tác phẩm, danh mục, upload, tương tác (Like, Comment).
    - **Inventory Service** (tích hợp trong Artwork): Quản lý kho, folder.
    - **Orders Service**: Quản lý giỏ hàng, đơn hàng (E-commerce flow).
    - **Payments Service**: Xử lý thanh toán (Stripe), hóa đơn (Invoices), rút tiền (Payouts).
    - **Messaging Service**: Chat realtime giữa người mua và nghệ sĩ.
    - **Notifications Service**: Quản lý thông báo đẩy và lịch sử thông báo.
    - **Community Service**: (Dự kiến) Quản lý bài đăng, thảo luận.

3.  **Communication (Giao tiếp liên dịch vụ)**:
    - **Synchronous (Đồng bộ)**: Sử dụng **NestJS Microservices (TCP)** cho các request cần phản hồi ngay (ví dụ: Login, Get Profile).
    - **Asynchronous (Bất đồng bộ)**: Sử dụng **RabbitMQ** để xử lý các tác vụ nền (Background jobs) như gửi email, xử lý ảnh, cập nhật thống kê.

## 2. Công nghệ Cốt lõi
| Thành phần | Công nghệ | Mục đích |
|---|---|---|
| **Framework** | NestJS (Node.js) | Xây dựng server-side application hiệu năng cao, kiến trúc module. |
| **Language** | TypeScript | Đảm bảo type-safety, dễ bảo trì. |
| **Database** | PostgreSQL | Cơ sở dữ liệu quan hệ chính (RDBMS). |
| **ORM** | TypeORM | Tương tác với Database qua Object. |
| **Message Broker** | RabbitMQ | Xử lý sự kiện (Event-driven architecture). |
| **API Style** | REST & GraphQL | API Gateway expose REST cho Client; Nội bộ có thể dùng GraphQL (Apollo Federation - đang triển khai). |
| **Infrastructure** | Docker, Kubernetes | Containerization và Orchestration. |

## 3. Sơ đồ Triển khai (Deployment Diagram)
*(Mô tả bằng lời)*
Client (Next.js) ---> **API Gateway** (Port 3000/4000)
                        |
                        +---> **Identity Service** (TCP) <---> DB Identity (Postgres)
                        |
                        +---> **Artwork Service** (TCP) <---> DB Artwork (Postgres)
                        |
                        +---> **Orders Service** (TCP) <---> DB Orders (Postgres)
                        |
                        +---> **Payments Service** (TCP) <---> DB Payments (Postgres)
                                      |
                                      v
                                  RabbitMQ (Message Bus)
