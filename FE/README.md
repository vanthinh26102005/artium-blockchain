# ARTIUM Frontend

Thư mục `FE/` chứa ứng dụng web Next.js cho hệ sinh thái ARTIUM. Frontend phục vụ các luồng chính như khám phá tác phẩm, chi tiết artwork, đăng nhập, portfolio/seller profile, inventory, quick sell, checkout Stripe, wallet checkout MetaMask, đấu giá Sepolia, quản lý đơn hàng và messaging.

## Công Nghệ Chính

| Nhóm               | Công nghệ                                             |
| ------------------ | ----------------------------------------------------- |
| Framework          | Next.js 16, React 19, TypeScript                      |
| Routing            | Next.js Pages Router trong `src/pages`                |
| Styling            | Tailwind CSS v4, Prettier Tailwind plugin             |
| UI primitives      | Radix UI, shadcn/ui patterns, Heroicons, Lucide React |
| Form/validation    | React Hook Form, Zod                                  |
| State/client logic | Zustand, custom hooks                                 |
| Blockchain         | `ethers`, MetaMask, Sepolia config qua env            |
| Realtime/payment   | Socket.IO client, Stripe React SDK                    |

## Cấu Trúc Thư Mục

```text
FE/
├── public/              # Static assets: images, videos, fonts
├── shared/              # Shared icons/assets ngoài src
├── src/
│   ├── @domains/        # Module theo nghiệp vụ: auth, auction, checkout, orders...
│   ├── @shared/         # API clients, shared components, hooks, constants, utils
│   ├── @types/          # Kiểu dữ liệu dùng chung
│   ├── components/      # Component dùng chung cấp ứng dụng
│   ├── pages/           # Next.js Pages Router
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript types bổ sung
│   └── views/           # Page-level view components
├── conventions/         # Quy ước và tài liệu nội bộ frontend
├── next.config.ts       # Cấu hình Next.js
├── tsconfig.json        # Alias `@/*`, `@shared/*`, `@domains/*`
└── package.json
```

Một số domain đang có trong `src/@domains`: `artwork-detail`, `auction`, `auth`, `checkout`, `discover`, `events`, `inventory`, `messaging`, `orders`, `portfolio`, `profile`, `quick-sell`, `seller`.

## Yêu Cầu Môi Trường

- Node.js 20+ khuyến nghị cho Next.js 16.
- npm 9+.
- Backend gateway đang chạy local hoặc URL API đã deploy.
- MetaMask nếu test wallet login, wallet checkout hoặc đấu giá Sepolia.

## Cài Đặt Và Chạy Local

```bash
cd FE
npm install
cp .env.example .env.local
npm run dev
```

Ứng dụng chạy tại <http://localhost:3000>.

Nếu gặp xung đột peer dependency trong môi trường local, có thể cài bằng:

```bash
npm install --legacy-peer-deps
```

## Biến Môi Trường

Sao chép `FE/.env.example` thành `FE/.env.local` và cập nhật giá trị thực tế.

| Biến                                                                                                                      | Mục đích                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                                                                                                     | Base URL của backend gateway, ví dụ `http://localhost:8081/api`. |
| `NEXT_PUBLIC_ARTWORK_API_URL`                                                                                             | Base URL riêng cho artwork API nếu cần tách.                     |
| `NEXT_PUBLIC_WS_URL`                                                                                                      | WebSocket URL cho realtime auction/messaging.                    |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                                                | Google OAuth cho NextAuth.                                       |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL`                                                                                         | Cấu hình NextAuth.                                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                                                                                      | Publishable key cho Stripe checkout.                             |
| `NEXT_PUBLIC_PLATFORM_ETH_WALLET`                                                                                         | Ví nhận thanh toán ETH của platform.                             |
| `NEXT_PUBLIC_WEB3_CHAIN_ID`, `NEXT_PUBLIC_WEB3_CHAIN_NAME`, `NEXT_PUBLIC_WEB3_RPC_URL`                                    | Cấu hình wallet login.                                           |
| `NEXT_PUBLIC_ETH_CHAIN_ID`, `NEXT_PUBLIC_ETH_CHAIN_NAME`, `NEXT_PUBLIC_ETH_RPC_URL`, `NEXT_PUBLIC_ETH_BLOCK_EXPLORER_URL` | Cấu hình wallet checkout/đấu giá Sepolia.                        |
| `NEXT_PUBLIC_AUCTION_ESCROW_CONTRACT_ADDRESS`                                                                             | Địa chỉ `ArtAuctionEscrow` trên Sepolia.                         |
| `NEXT_PUBLIC_SELLER_AUCTION_MIN_DURATION_SECONDS`, `NEXT_PUBLIC_SELLER_AUCTION_MAX_DURATION_SECONDS`                      | Giới hạn thời lượng đấu giá seller tạo.                          |

Không commit `.env.local` hoặc secret OAuth/Stripe.

## Lệnh Phát Triển

| Lệnh                   | Công dụng                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Chạy dev server có hot reload.                  |
| `npm run build`        | Build production.                               |
| `npm run start`        | Chạy production server sau khi build.           |
| `npm run lint`         | Chạy ESLint.                                    |
| `npm run docker:local` | Build và chạy Docker local từ `.env.local`.     |
| `npm run docker:prod`  | Build và chạy Docker production từ `.env.prod`. |

## Quy Ước Code

- Viết component React bằng `PascalCase`, hooks theo mẫu `useSomething`.
- Ưu tiên import alias `@shared/*` và `@domains/*` thay vì deep relative import.
- Đặt logic nghiệp vụ theo domain trong `src/@domains/<domain>`.
- Đặt component, hook, service dùng chung trong `src/@shared`.
- Kiểm tra UI bằng `npm run lint` và `npm run build` trước khi nộp thay đổi.

## Tích Hợp Blockchain

Frontend yêu cầu MetaMask khi người dùng thực hiện các thao tác on-chain. Ứng dụng kiểm tra chain Sepolia, yêu cầu switch network nếu sai, gửi transaction qua MetaMask, nhận `txHash`, hiển thị trạng thái giao dịch và để backend xác minh/cập nhật order/payment.

Contract Sepolia hiện tại:

```text
0x59D1Cff823e14d8E874CF35619a021dC43f5eff0
```

Explorer: <https://sepolia.etherscan.io/address/0x59D1Cff823e14d8E874CF35619a021dC43f5eff0>
