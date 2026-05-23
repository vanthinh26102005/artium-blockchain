# ARTIUM Backend

Thư mục `BE/` là backend monorepo của ARTIUM, được xây bằng NestJS và Yarn Workspaces. Backend gồm API Gateway và các microservice phụ trách auth, artwork, order, payment, realtime, notification và các module cộng đồng/sự kiện/CRM.

## Kiến Trúc Tổng Quan

Hệ thống backend đi theo các hướng chính:

- Microservices với từng service nằm trong `apps/`.
- DDD, Clean Architecture và CQRS cho các use case chính.
- Event-driven communication qua RabbitMQ.
- Transactional outbox và các shared library trong `libs/`.
- REST/Swagger cho từng service và gateway làm điểm vào API.
- Blockchain integration để đồng bộ event từ `ArtAuctionEscrow` và cập nhật order/payment.

Tài liệu kiến trúc chi tiết nằm tại [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) và [`apps/readme.md`](./apps/readme.md).

## Cấu Trúc Thư Mục

```text
BE/
├── apps/                     # NestJS applications / microservices
│   ├── api-gateway/
│   ├── artwork-service/
│   ├── community-service/
│   ├── crm-service/
│   ├── events-service/
│   ├── identity-service/
│   ├── messaging-service/
│   ├── notifications-service/
│   ├── orders-service/
│   └── payments-service/
├── libs/                     # Shared libraries
│   ├── api-clients/
│   ├── auth/
│   ├── blockchain/
│   ├── common/
│   ├── metrics/
│   ├── outbox/
│   └── rabbitmq/
├── docs/                     # Backend architecture and feature docs
├── docker-compose.yml
├── docker-compose.shared.yml
├── docker-compose.isolated.yml
├── nest-cli.json
└── package.json
```

## Danh Sách Service

| Service                 | Script dev               | Vai trò                                                                   |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------- |
| `api-gateway`           | `yarn dev:gateway`       | Gateway REST/GraphQL, điểm vào cho frontend.                              |
| `identity-service`      | `yarn dev:identity`      | Đăng ký, đăng nhập, JWT, Google OAuth, profile người dùng/seller.         |
| `artwork-service`       | `yarn dev:artwork`       | Quản lý artwork, folder, tag, inventory và metadata.                      |
| `orders-service`        | `yarn dev:orders`        | Giỏ hàng, checkout, order lifecycle, đấu giá và đồng bộ event blockchain. |
| `payments-service`      | `yarn dev:payments`      | Stripe, invoice, payment transaction và blockchain payment integration.   |
| `messaging-service`     | `yarn dev:messaging`     | Chat realtime, conversation, attachments, read receipt.                   |
| `notifications-service` | `yarn dev:notifications` | Email, push, in-app notification, notification templates.                 |
| `community-service`     | `yarn dev:community`     | Follow, moodboard, moment, like/comment, activity feed.                   |
| `events-service`        | `yarn dev:events`        | Event, RSVP, guest list, event artwork.                                   |
| `crm-service`           | `yarn dev:crm`           | Contact, campaign, promotion, private view, segmentation.                 |

## Shared Libraries

| Library            | Vai trò                                                    |
| ------------------ | ---------------------------------------------------------- |
| `libs/common`      | Enum, DTO, database helper, shared utility.                |
| `libs/auth`        | JWT guards, strategies và auth module dùng chung.          |
| `libs/rabbitmq`    | Queue, exchange, routing key và module RabbitMQ.           |
| `libs/outbox`      | Hỗ trợ transactional outbox.                               |
| `libs/blockchain`  | Provider, contract service và listener cho event on-chain. |
| `libs/api-clients` | Client nội bộ giữa các service.                            |
| `libs/metrics`     | Metric/observability dùng chung.                           |

## Yêu Cầu Môi Trường

- Node.js 20+.
- Yarn 1.22.x (`packageManager` đang là `yarn@1.22.22`).
- Docker và Docker Compose.
- PostgreSQL/Redis/RabbitMQ được start bằng Docker Compose.
- Sepolia RPC, contract address và Stripe key nếu test payment/blockchain.

## Cài Đặt Local

```bash
cd BE
yarn install
cp .env.example .env.local
yarn docker:up:shared
yarn dev:gateway
```

Chạy một service riêng:

```bash
yarn dev:identity
yarn dev:artwork
yarn dev:orders
yarn dev:payments
```

Chạy tất cả service theo script workspace:

```bash
yarn dev:all
```

Nếu chỉ cần frontend gọi API trong lúc demo, thường bật `api-gateway` kèm các service phụ thuộc của luồng đang test là đủ.

## Docker Compose

| Lệnh                       | Công dụng                                  |
| -------------------------- | ------------------------------------------ |
| `yarn docker:up:shared`    | Start stack với profile shared.            |
| `yarn docker:up:isolated`  | Start stack với profile isolated.          |
| `yarn docker:local:shared` | Start stack shared và đọc `.env.local`.    |
| `yarn docker:prod:shared`  | Start stack shared và đọc `.env.prod`.     |
| `yarn docker:down`         | Stop các container backend/infrastructure. |

Infrastructure trong compose gồm PostgreSQL databases, Redis, RabbitMQ và MailHog. RabbitMQ UI thường được map tại port `15672`.

## Biến Môi Trường Chính

`BE/.env.example` gồm các nhóm biến sau:

| Nhóm       | Biến tiêu biểu                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `JWT_SECRET`                                                                                                                                                                              |
| Blockchain | `ETHEREUM_QUOTE_SIGNING_SECRET`, `PLATFORM_PRIVATE_KEY`, `PLATFORM_ETH_WALLET`, `BLOCKCHAIN_RPC_URL`, `CONTRACT_ADDRESS`, `ETHEREUM_CHECKOUT_BLOCK_EXPLORER_URL`, `ETHEREUM_QUOTE_TTL_MS` |
| Auction    | `SELLER_AUCTION_MIN_DURATION_SECONDS`, `SELLER_AUCTION_MAX_DURATION_SECONDS`                                                                                                              |
| Stripe     | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`                                                                                                                                                 |
| OAuth      | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                                                                                                                |
| Database   | `POSTGRES_PASSWORD`, `SHARED_DB_PASSWORD`, `IDENTITY_DB_PASSWORD`, `PAYMENTS_DB_PASSWORD`, `ORDERS_DB_PASSWORD`                                                                           |
| RabbitMQ   | `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`                                                                                                                                          |

Không commit `.env`, `.env.local`, `.env.prod`, private key, Stripe secret, JWT secret hoặc service account thật.

## Lệnh Phát Triển Và Kiểm Tra

| Lệnh                   | Công dụng                                  |
| ---------------------- | ------------------------------------------ |
| `yarn build:workspace` | Build tất cả workspace.                    |
| `yarn build:gateway`   | Build API Gateway.                         |
| `yarn build:<service>` | Build service riêng nếu package có script. |
| `yarn format`          | Format `apps/**/*.ts` và `libs/**/*.ts`.   |
| `yarn lint`            | Chạy ESLint và auto-fix.                   |
| `yarn test`            | Chạy Jest tests.                           |
| `yarn test:watch`      | Chạy Jest watch mode.                      |
| `yarn test:cov`        | Sinh coverage report.                      |
| `yarn test:e2e`        | Chạy e2e theo config của app backend.      |
| `yarn seed`            | Chạy seed tổng hợp từ `seed-all.ts`.       |
| `yarn seed:identity`   | Seed identity service.                     |
| `yarn seed:artwork`    | Seed artwork service.                      |
| `yarn seed:messaging`  | Seed messaging service.                    |

## Blockchain Integration

Backend sử dụng `libs/blockchain` để cấu hình provider, contract instance và listener. Các event từ `ArtAuctionEscrow` được publish qua RabbitMQ với routing keys trong `libs/rabbitmq`, sau đó `orders-service` và `notifications-service` cập nhật order/payment/notification.

Contract Sepolia hiện tại:

```text
0x59D1Cff823e14d8E874CF35619a021dC43f5eff0
```

Explorer: <https://sepolia.etherscan.io/address/0x59D1Cff823e14d8E874CF35619a021dC43f5eff0>

## Quy Ước Code

- Giữ đúng layer: `domain`, `application`, `infrastructure`, `presentation`.
- Command/query handler không đặt logic HTTP trực tiếp.
- Controller/resolver chỉ validate/ủy quyền và gọi use case.
- Shared concern đưa vào `libs/` khi nhiều service dùng chung.
- Test backend theo pattern `*.spec.ts` trong `apps/` hoặc `libs/`.
