# ARTIUM Documentation

Thư mục `docs/` chứa tài liệu hỗ trợ cho đồ án ARTIUM: kiến trúc frontend/backend, API, cài đặt local, smart contract và minh chứng tối ưu kỹ thuật web.

## Cấu Trúc Tài Liệu

| Đường dẫn                                                      | Nội dung                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`architecture/backend.md`](./architecture/backend.md)         | Tổng quan backend NestJS microservices, service map, CQRS, event-driven và infrastructure. |
| [`architecture/frontend.md`](./architecture/frontend.md)       | Tổng quan frontend Next.js, domain structure, shared layer và quy ước code.                |
| [`guides/local-setup.md`](./guides/local-setup.md)             | Hướng dẫn cài đặt local cho FE, BE và smart contract.                                      |
| [`api/README.md`](./api/README.md)                             | Tài liệu API gateway, REST endpoints, auth và RabbitMQ event communication.                |
| [`smart-contracts/overview.md`](./smart-contracts/overview.md) | Tổng quan `ArtAuctionEscrow`, Hardhat và deploy/test contract.                             |
| [`web-optimization/Report.md`](./web-optimization/Report.md)   | Báo cáo minh chứng tối ưu kỹ thuật web.                                                    |
| [`web-optimization/before/`](./web-optimization/before/)       | Số liệu/trạng thái trước tối ưu.                                                           |
| [`web-optimization/after/`](./web-optimization/after/)         | Số liệu/trạng thái sau tối ưu.                                                             |

## Liên Kết Nhanh Trong Repo

- [Backend Architecture](./architecture/backend.md)
- [Frontend Architecture](./architecture/frontend.md)
- [Local Development Setup](./guides/local-setup.md)
- [API Reference](./api/README.md)
- [Smart Contract Overview](./smart-contracts/overview.md)
- [Web Optimization Report](./web-optimization/Report.md)

## Tài Nguyên Nộp Bài Bên Ngoài

| Tài nguyên                     | Liên kết                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| GitHub repository public       | <https://github.com/vanthinh26102005/artium-blockchain>                                            |
| Frontend demo                  | <https://dgpthinh.io.vn/>                                                                          |
| Backend/API demo               | <https://api.dgpthinh.io.vn>                                                                       |
| Video báo cáo/demo             | <https://www.youtube.com/watch?v=hthnPuZ52V8>                                                      |
| File báo cáo PDF               | <https://drive.google.com/file/d/172Ex4Hxc-SRLJyN2D_F_EIVTlWSzGTg_/view?usp=sharing>               |
| Slide thuyết trình             | <https://www.canva.com/design/DAHIC2BNFRY/r-gRWoTJvsGayD_JcqPhXg/edit>                             |
| Tài liệu API / Swagger         | <https://docs.google.com/document/d/1m6mDKZ7K3Cqgptblh7utfQDO_bAkxt9GFcAcveiPW80/edit?usp=sharing> |
| Draw.io / các loại sơ đồ       | <https://drive.google.com/file/d/1nle53G0Oy59DsJr4aPCKV59z-Gxmj3S3/view?usp=sharing>               |
| Tài liệu hướng dẫn demo        | <https://docs.google.com/document/d/15uRteUeCxph0P0DwCRKqUOqOKmHQkpyVp4qujV7lksk/edit?usp=sharing> |
| Tài liệu hướng dẫn cài đặt     | <https://docs.google.com/document/d/1RWRiosK-TpweZLlDnsj6OYB-acHv_H89DsuIk2ssg2s/edit?usp=sharing> |
| Minh chứng tối ưu kỹ thuật web | <https://drive.google.com/drive/folders/1iHF2ImTryipPEJ6GSeR7MxqWzMLe4V80?usp=sharing>             |
| Drive tổng hợp của nhóm        | <https://drive.google.com/drive/u/0/folders/1YKXviv7ZI59qVESqiUzTY4RjywAoGWvr>                     |

## Smart Contract Sepolia

| Nội dung  | Thông tin                                                                         |
| --------- | --------------------------------------------------------------------------------- |
| Contract  | `ArtAuctionEscrow`                                                                |
| Địa chỉ   | `0x59D1Cff823e14d8E874CF35619a021dC43f5eff0`                                      |
| Explorer  | <https://sepolia.etherscan.io/address/0x59D1Cff823e14d8E874CF35619a021dC43f5eff0> |
| Ví deploy | `0x77a2Ac8226Cdbb13aD77859B204405ABb0AE2E89`                                      |

## Nguyên Tắc Cập Nhật Docs

- Cập nhật tài liệu khi thay đổi API, biến môi trường, command chạy local, workflow deploy hoặc smart contract.
- Ưu tiên link đến file trong repo thay vì lặp lại nội dung quá dài.
- Không đưa private key, token, `.env` thật, service account hoặc dữ liệu nhạy cảm vào docs.
