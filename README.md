# ARTIUM - Hệ sinh thái cho nghệ thuật tích hợp Blockchain

ARTIUM là đồ án của Nhóm 10 cho môn IE213 - Kỹ thuật phát triển hệ thống Web. Dự án mô phỏng một hệ sinh thái nghệ thuật số kết hợp marketplace, quản lý tác phẩm, hồ sơ nghệ sĩ/người bán, checkout, đấu giá, thanh toán truyền thống và ký quỹ blockchain trên Ethereum Sepolia.

## Thông Tin Nộp Bài

| Nội dung             | Thông tin                                                |
| -------------------- | -------------------------------------------------------- |
| Số thứ tự nhóm       | Nhóm 10                                                  |
| Tên đề tài           | ARTIUM - Hệ sinh thái cho nghệ thuật tích hợp Blockchain |
| Môn học              | IE213 - Kỹ thuật phát triển hệ thống Web                 |
| Giảng viên hướng dẫn | ThS. Võ Tấn Khoa                                         |
| Lớp                  | IE213.Q21                                                |
| Ngày nộp             | 28/04/2026                                               |

## Thành Viên Và Tỷ Lệ Đóng Góp

| STT | MSSV     | Họ và tên         | Vai trò trong nhóm                                                                                                                                                      | Tỷ lệ |
| --- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | 23521500 | Ngô Văn Thịnh     | Nhóm trưởng, điều phối dự án, hỗ trợ fullstack và blockchain, rà soát tích hợp frontend/backend/smart contract, tổng hợp báo cáo và demo.                               | 20.6% |
| 2   | 23521647 | Phan Hữu Trí      | Phụ trách frontend và blockchain integration: giao diện người dùng, MetaMask login, wallet checkout, hiển thị trạng thái giao dịch và hỗ trợ demo frontend.             | 19.6% |
| 3   | 23521827 | Hồ Vương Tường Vy | Phụ trách frontend, tài liệu và luồng nghiệp vụ: hỗ trợ giao diện, use case, sequence, ERD, báo cáo, slide, minh chứng demo và tối ưu kỹ thuật web.                     | 19.6% |
| 4   | 23521497 | Dương Phước Thịnh | Phụ trách backend và blockchain: Orders/Payments service, Ethereum transaction confirmation, blockchain event sync, smart contract integration và deploy/demo kỹ thuật. | 20.6% |
| 5   | 23520314 | Phạm Viết Đức     | Phụ trách backend, blockchain và kiểm thử: hỗ trợ API/database, smart contract test, kiểm thử luồng chính, Docker/Swagger/minh chứng triển khai.                        | 19.6% |
|     |          |                   | Tổng tỷ lệ đóng góp                                                                                                                                                     | 100%  |

## Liên Kết Quan Trọng

| Nội dung                            | Liên kết                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| GitHub repository public            | <https://github.com/vanthinh26102005/artium-blockchain>                                |
| Frontend demo                       | <https://dgpthinh.io.vn/>                                                              |
| Backend/API demo                    | <https://api.dgpthinh.io.vn>                                                           |
| Video báo cáo/demo YouTube Unlisted | <https://www.youtube.com/watch?v=hthnPuZ52V8>                                          |
| ClickUp quản lý công việc           | <https://app.clickup.com/90182611663/v/o/s/901810588376>                               |
| File báo cáo PDF                    | <https://drive.google.com/file/d/172Ex4Hxc-SRLJyN2D_F_EIVTlWSzGTg_/view?usp=sharing>   |
| Slide thuyết trình                  | <https://www.canva.com/design/DAHIC2BNFRY/r-gRWoTJvsGayD_JcqPhXg/edit>                 |
| Minh chứng tối ưu kỹ thuật web      | <https://drive.google.com/drive/folders/1iHF2ImTryipPEJ6GSeR7MxqWzMLe4V80?usp=sharing> |
| Drive tổng hợp của nhóm             | <https://drive.google.com/drive/u/0/folders/1YKXviv7ZI59qVESqiUzTY4RjywAoGWvr>         |

Lưu ý về ClickUp: workspace có tính bảo mật, nhóm đã gửi lời mời tham gia workspace đến email `khoavt@uit.edu.vn` để giảng viên có thể xem và đánh giá quá trình quản lý công việc.

## Tài Nguyên Bổ Sung

| Tài nguyên                 | Liên kết                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Tài liệu API / Swagger     | <https://docs.google.com/document/d/1m6mDKZ7K3Cqgptblh7utfQDO_bAkxt9GFcAcveiPW80/edit?usp=sharing> |
| Các loại sơ đồ / Draw.io   | <https://drive.google.com/file/d/1nle53G0Oy59DsJr4aPCKV59z-Gxmj3S3/view?usp=sharing>               |
| Tài liệu hướng dẫn demo    | <https://docs.google.com/document/d/15uRteUeCxph0P0DwCRKqUOqOKmHQkpyVp4qujV7lksk/edit?usp=sharing> |
| Tài liệu hướng dẫn cài đặt | <https://docs.google.com/document/d/1RWRiosK-TpweZLlDnsj6OYB-acHv_H89DsuIk2ssg2s/edit?usp=sharing> |

Minh chứng tối ưu kỹ thuật web được tổng hợp trong thư mục Drive bên trên và tại mục 4.8 của file báo cáo đồ án.

## Cấu Trúc Repository

```text
artium-ie213-blockchain/
├── FE/          # Frontend Next.js, React, Tailwind CSS
├── BE/          # Backend NestJS monorepo, Yarn workspaces
├── contracts/   # Smart contract Solidity, Hardhat config, deploy/test scripts
├── docs/        # Tài liệu kiến trúc, API, cài đặt, smart contract, tối ưu web
├── scripts/     # Script hỗ trợ phụ trợ
├── README.md    # Tài liệu tổng quan dự án
└── .gitignore   # Bỏ qua file build, dependency, cache và secret local
```

## Thành Phần Hệ Thống

| Thư mục      | Vai trò                                                                                                                                                    | Tài liệu riêng                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `FE/`        | Ứng dụng web cho collector, seller và admin-facing flows: khám phá tác phẩm, chi tiết artwork, profile, inventory, checkout, đấu giá, đơn hàng, messaging. | [`FE/README.md`](./FE/README.md)               |
| `BE/`        | Backend microservices bằng NestJS: API gateway, identity, artwork, orders, payments, messaging, notifications, community, events, CRM.                     | [`BE/README.md`](./BE/README.md)               |
| `contracts/` | Hardhat project chứa smart contract `ArtAuctionEscrow`, test và script deploy Sepolia/local.                                                               | [`contracts/README.md`](./contracts/README.md) |
| `docs/`      | Tài liệu thiết kế, local setup, API, smart contract và minh chứng tối ưu kỹ thuật web.                                                                     | [`docs/README.md`](./docs/README.md)           |

## Smart Contract Đã Triển Khai

| Nội dung             | Thông tin                                                                         |
| -------------------- | --------------------------------------------------------------------------------- |
| Tên smart contract   | `ArtAuctionEscrow`                                                                |
| Ngôn ngữ             | Solidity                                                                          |
| Mạng testnet         | Sepolia                                                                           |
| Địa chỉ contract     | `0x59D1Cff823e14d8E874CF35619a021dC43f5eff0`                                      |
| Block explorer       | <https://sepolia.etherscan.io/address/0x59D1Cff823e14d8E874CF35619a021dC43f5eff0> |
| Framework phát triển | Hardhat                                                                           |
| Ví deploy            | `0x77a2Ac8226Cdbb13aD77859B204405ABb0AE2E89`                                      |

`ArtAuctionEscrow` phục vụ nghiệp vụ đấu giá và ký quỹ cho tác phẩm nghệ thuật vật lý. Contract quản lý vòng đời phiên đấu giá, gồm tạo auction, đặt bid bằng ETH, kết thúc auction, giữ tiền escrow, xác nhận giao hàng, giải ngân cho seller, hoàn tiền cho bidder bị vượt giá và xử lý tranh chấp/thời hạn.

Chức năng chính:

- `createAuction`: tạo phiên đấu giá mới và liên kết với `orderId` off-chain.
- `bid`: cho phép người dùng đặt giá bằng ETH.
- `withdraw`: cho phép bidder bị outbid rút lại tiền.
- `endAuction`: kết thúc phiên đấu giá sau khi hết thời gian.
- `markShipped`: seller đánh dấu đã giao hàng.
- `confirmDelivery`: buyer xác nhận đã nhận artwork, contract giải ngân ETH cho seller.
- `openDispute`: buyer mở tranh chấp.
- `resolveDispute`: arbiter xử lý tranh chấp.
- `claimShippingTimeout`: buyer claim refund nếu seller không giao hàng đúng hạn.
- `claimDeliveryTimeout`: seller claim tiền nếu buyer không xác nhận đúng hạn.
- `claimDisputeTimeout`: buyer claim refund nếu dispute không được xử lý đúng hạn.
- `getAuction` / `getAuctionTimeline`: đọc dữ liệu auction và timeline.
- Events: `AuctionStarted`, `NewBid`, `AuctionEnded`, `Withdrawn`, `DeliveryConfirmed`, `AuctionCancelled`, `AuctionExtended`, `ArtShipped`, `DisputeOpened`, `DisputeResolved`, `ShippingTimeout`, `DeliveryTimeout`.

## Cách Website Tương Tác Với Smart Contract

Website tích hợp smart contract thông qua MetaMask và backend service:

1. Người dùng kết nối MetaMask trên frontend.
2. Frontend kiểm tra network hiện tại và yêu cầu chuyển sang Sepolia nếu sai mạng.
3. Khi người dùng thao tác blockchain, frontend gửi transaction thông qua MetaMask.
4. Smart contract xử lý logic on-chain và emit event.
5. Frontend nhận transaction hash và hiển thị trạng thái giao dịch.
6. Backend ghi nhận `txHash`, xác minh transaction trên Sepolia và cập nhật trạng thái payment/order.
7. System/indexer hoặc Orders Service đồng bộ event từ smart contract về database để frontend hiển thị trạng thái mới nhất.

## Cài Đặt Nhanh

### Frontend

```bash
cd FE
npm install
cp .env.example .env.local
npm run dev
```

Frontend mặc định chạy tại <http://localhost:3000>.

### Backend

```bash
cd BE
yarn install
cp .env.example .env.local
yarn docker:up:shared
yarn dev:gateway
```

API Gateway local mặc định đọc từ compose qua port `8081`; các service riêng dùng các script `yarn dev:<service>`.

### Smart Contract

```bash
cd contracts
npm install
npm run compile
npm test
```

Deploy Sepolia cần các biến môi trường `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY`, `ARBITER_ADDRESS`, `PLATFORM_WALLET_ADDRESS`, `PLATFORM_FEE_BPS`.

## Lệnh Kiểm Tra Chính

| Thành phần       | Lệnh                              |
| ---------------- | --------------------------------- |
| Frontend lint    | `cd FE && npm run lint`           |
| Frontend build   | `cd FE && npm run build`          |
| Backend test     | `cd BE && yarn test`              |
| Backend coverage | `cd BE && yarn test:cov`          |
| Backend build    | `cd BE && yarn build:workspace`   |
| Contract compile | `cd contracts && npm run compile` |
| Contract test    | `cd contracts && npm test`        |

## Thông Tin File Nộp Chính Thức

- `Group 10.pdf`
- `Group 10_Project_Report.pdf`

Người đại diện nhóm nộp bài trên Moodle Workshop:

| Nội dung      | Thông tin                |
| ------------- | ------------------------ |
| Họ và tên     | Ngô Văn Thịnh            |
| MSSV          | 23521500                 |
| Email liên hệ | `23521500@gm.uit.edu.vn` |

Nhóm xác nhận các thông tin và liên kết trong file nộp là chính xác, có thể truy cập tại thời điểm nộp bài và trong thời gian chấm điểm.

## Bảo Mật Và Cấu Hình

Không commit `.env`, private key, mnemonic phrase, API token, credential thật, `node_modules`, `.next`, `dist`, `coverage`, Hardhat `artifacts` hoặc `cache`. Repository chỉ nên chứa file mẫu như `.env.example`; các secret như `PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `ETHERSCAN_API_KEY`, Stripe key, JWT secret và database password phải được cấu hình local hoặc trên môi trường deploy.
