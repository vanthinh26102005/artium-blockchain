# Hướng Dẫn Kích Hoạt và Tương Tác Giả Lập Mạng Lưới Nội Bộ (Local Deployment)

Biết cách triển khai các Smart Contract ở local trước khi lên public là một kỹ năng bắt buộc. Các bước dưới đây sẽ giúp cho bạn thao tác và cấu hình dự án đúng kỹ thuật.

## Bước 1: Khởi động nút mạng máy chủ giả lập (Hardhat Local Node)

Mạng blockchain ảo này là một thành phần sống, nó sẽ giữ tất cả các trạng thái (State) của Smart Contract như: "Địa chỉ của Smart Contract là gì?", "Tài khoản nào đã gửi bao nhiêu tiền?". Mạng lưới này cần được chạy liên tục trong suốt quá trình các Frontend và Backend kết nối đến.

1. Mở cửa sổ **Terminal 1**
2. Di chuyển vào thư mục Smart Contract (nếu chưa vào) và chạy lệnh khởi động Node:

```bash
cd BE/packages/smart-contracts
npx hardhat node
```

_Bạn sẽ thấy danh sách 20 tài khoản và Private Key hiện ra. Mỗi tài khoản có sẵn 10000 ETH ảo nạp sẵn vô đó._

> **⚠️ LƯU Ý QUAN TRỌNG:**
>
> - Đừng đóng hoặc nhập thêm bất cứ dòng lệnh nào vào Terminal 1 này. Hãy giữ nó đang chạy ngầm mạng lưới.
> - Bất cứ khi nào bạn nhấn `Ctrl + C` để tắt terminal này, mạng lưới và tất cả dữ liệu giả lập bên trong (gồm cả Smart Contract đã deploy) sẽ bị **xóa sạch**. Bạn sẽ phải Deploy lại từ đầu.

## Bước 2: Deploy Smart Contract lên mạng lưới giả lập

Bây giờ mạng lưới chạy ở Terminal 1 đã sẵn sàng, chúng ta sẽ mở một cửa sổ mới và gửi đoạn code Contract "lên" mạng lưới qua cổng giao tiếp.

1. Mở thêm của sổ **Terminal 2**.
2. Di chuyển cũng vô tận cùng hệ thống và thực thi script:

```bash
cd BE/packages/smart-contracts
npx hardhat run scripts/deploy.local.ts --network localhost
```

## Bước 3: Thu thập thông tin giao tiếp cho các tầng (Frontend/Backend)

Terminal 2 sẽ hiển thị các thông số mà bên thiết kế Server Application và Web Application cần để kết nối, ví dụ:

```text
==========================================
📍 THÔNG TIN ĐỂ CHẠY LOCAL TEST:
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployer (Admin): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Test User 1     : 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
...
==========================================
```

Đồng thời bạn sẽ tìm thấy **ABI** (Bản đồ tương tác với ứng dụng) tại: `artifacts/contracts/ArtAuctionEscrow.sol/ArtAuctionEscrow.json`

## Khắc phục lỗi phổ biến:

Nếu bạn chạy thử và bị báo lỗi **"Need to install the following packages: hardhat@3.1..."**, nguyên nhân có thể là do terminal đang không ở trúng trong thư mục chứa file cấu hình `package.json` của Hardhat.

Hãy luôn đảm bảo bạn đã chạy lệnh `cd BE/packages/smart-contracts` ở mỗi cửa sổ Terminal mới sinh ra.
