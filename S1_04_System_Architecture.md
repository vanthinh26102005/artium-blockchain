# ARTIUM MARKETPLACE
## Payment Module — Blockchain Architecture

> Kiến trúc thanh toán kết hợp Blockchain cho website bán tranh vật lý kết nối Artists & Buyers

| | |
|---|---|
| **Scope** | Đồ án sinh viên — Payment Module với Blockchain |
| **Tech Stack** | React.js + Node.js/Express + MongoDB + Solidity (Sepolia Testnet) |
| **Đặc biệt** | Escrow Smart Contract + NFT Certificate of Authenticity |

> 💡 **Điểm nổi bật:** Thay vì chỉ đơn thuần thanh toán crypto, hệ thống kết hợp **Escrow pattern** (bảo vệ cả buyer lẫn artist — tiền chỉ chuyển khi buyer xác nhận nhận tranh) và **NFT Certificate** (chứng nhận tính xác thực tranh vật lý thông qua blockchain). Đây là mô hình đang được các gallery thực tế áp dụng, phù hợp để trình bày đồ án.

---

## Mục lục

1. [Phân tách dữ liệu On-chain vs Off-chain](#1-phân-tách-dữ-liệu-on-chain-vs-off-chain)
2. [Bảng so sánh On-chain vs Off-chain](#2-bảng-so-sánh-tổng-hợp)
3. [Sơ đồ kiến trúc tổng thể](#3-sơ-đồ-kiến-trúc-tổng-thể)
4. [Luồng dữ liệu chi tiết](#4-luồng-dữ-liệu-chi-tiết)
5. [Payment Flow — 5 bước thanh toán](#5-payment-flow--5-bước-thanh-toán-chi-tiết)
6. [Vì sao KHÔNG lưu tất cả lên Blockchain?](#6-vì-sao-không-lưu-tất-cả-lên-blockchain)
7. [Lý do phân tách kiến trúc & Mô hình Hybrid](#7-lý-do-phân-tách-kiến-trúc--mô-hình-hybrid)

---

## 1. Phân tách dữ liệu On-chain vs Off-chain

**Nguyên tắc cốt lõi:** Chỉ đưa lên blockchain những gì **THỰC SỰ CẦN** tính minh bạch, bất biến, và trustless. Mọi thứ khác lưu off-chain để đảm bảo tốc độ, chi phí thấp, và linh hoạt.

### 🔗 ON-CHAIN (Blockchain)

*Nguyên tắc: Chỉ lưu những gì CẦN minh bạch, bất biến, và trustless*

| Dữ liệu | Lý do lưu On-chain |
|---|---|
| **Payment Transaction Hash** | Bằng chứng thanh toán không thể giả mạo |
| **Escrow State** (Paid → Confirmed → Released / Refunded) | Trạng thái escrow minh bạch, trustless — không ai can thiệp được |
| **Số tiền thanh toán (ETH)** | Ghi nhận giá trị giao dịch chính xác, công khai |
| **Wallet Address** (buyer & artist) | Định danh các bên tham gia giao dịch |
| **NFT Certificate of Authenticity** | Chứng nhận nguồn gốc & quyền sở hữu tranh — tồn tại vĩnh viễn |
| **Timestamp giao dịch** | Mốc thời gian không thể sửa đổi |

### 🗄 OFF-CHAIN (Backend + MongoDB)

*Nguyên tắc: Dữ liệu lớn, thay đổi thường xuyên, nhạy cảm, hoặc tạm thời*

| Dữ liệu | Lý do lưu Off-chain |
|---|---|
| **User Profile** (tên, email, avatar, password) | Dữ liệu cá nhân — GDPR, cần update thường xuyên |
| **Chi tiết Artwork** (tên, mô tả, ảnh, giá) | Dung lượng lớn (ảnh HD), thay đổi liên tục |
| **Gallery & Exhibition data** | Nội dung động, không cần immutable |
| **Shopping Cart & Wishlist** | Dữ liệu tạm thời, thay đổi liên tục |
| **Order Details** (địa chỉ ship, tracking, notes) | Thông tin nhạy cảm & riêng tư |
| **Chat / Messages** giữa artist & buyer | Dung lượng lớn, riêng tư |
| **Reviews & Ratings** | Có thể edit/delete, không cần immutable |
| **Session, Auth Tokens** | Dữ liệu tạm, hết hạn liên tục |

---

## 2. Bảng so sánh tổng hợp

| Tiêu chí | On-chain (Blockchain) | Off-chain (Backend + DB) |
|---|---|---|
| **Chi phí lưu trữ** | Rất cao (gas fee mỗi giao dịch) | Thấp (server cost cố định) |
| **Tốc độ truy vấn** | Chậm (~15-30s, cần consensus) | Nhanh (milliseconds) |
| **Tính bất biến** | ✅ Không thể sửa/xóa | ❌ Có thể CRUD tự do |
| **Tính riêng tư** | ❌ Public (ai cũng xem được) | ✅ Kiểm soát access (private) |
| **Dung lượng** | Rất giới hạn (mỗi byte = tiền) | Gần như không giới hạn |
| **Phù hợp cho** | Giao dịch tài chính, chứng nhận | Profile, content, media, chat |
| **Khả năng mở rộng** | Giới hạn (throughput thấp) | Cao (scale horizontal) |
| **Cần thiết khi** | Cần TRUST giữa các bên | Dữ liệu nội bộ, thay đổi thường |

---

## 3. Sơ đồ kiến trúc tổng thể

Kiến trúc theo mô hình **Layered Architecture**, mỗi tầng có trách nhiệm riêng biệt. Luồng dữ liệu chính đi từ trên xuống trong quá trình thanh toán.

```
┌─────────────────────────────────────────────────────────────────┐
│  👤  TẦNG 1: USER / BUYER                                      │
│  ┌───────────────────┐  ┌─────────────────────┐                │
│  │  Browser / Mobile  │  │  MetaMask Wallet    │                │
│  └───────────────────┘  └─────────────────────┘                │
│  Truy cập website, kết nối MetaMask wallet                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  🖥  TẦNG 2: FRONTEND (React.js)                                │
│  ┌──────────────┐ ┌───────────┐ ┌─────────┐ ┌──────────────┐  │
│  │   React      │ │ ethers.js │ │  Axios  │ │ MetaMask SDK │  │
│  │  Components  │ │  (Web3)   │ │(REST API)│ │              │  │
│  └──────────────┘ └───────────┘ └─────────┘ └──────────────┘  │
│  Giao diện người dùng, gọi API & tương tác Smart Contract      │
└──────────┬──────────────────────────────────┬──────────────────┘
           │ REST API                         │ ethers.js
           ▼                                  │
┌──────────────────────────────────┐          │
│  ⚙️  TẦNG 3: BACKEND             │          │
│  (Node.js + Express)             │          │
│  ┌────────────────┐ ┌─────────┐ │          │
│  │ REST API       │ │ MongoDB │ │          │
│  │ Endpoints      │ │         │ │          │
│  ├────────────────┤ ├─────────┤ │          │
│  │ JWT Auth       │ │ Users   │ │          │
│  ├────────────────┤ │ Artworks│ │          │
│  │ Order Mgmt     │ │ Orders  │ │          │
│  ├────────────────┤ └─────────┘ │          │
│  │ Event Listener │◄────────────┼──────┐   │
│  └────────────────┘             │      │   │
│  Xử lý business logic,         │      │   │
│  lưu trữ off-chain, xác thực   │      │   │
└─────────────────────────────────┘      │   │
                                         │   │
                               event sync│   │
                                         │   ▼
┌─────────────────────────────────────────────────────────────────┐
│  📜  TẦNG 4: SMART CONTRACT (Solidity)                          │
│                                                                  │
│  ArtPaymentEscrow.sol                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  createOrder()       — Buyer gửi ETH vào escrow         │   │
│  │  confirmDelivery()   — Buyer xác nhận → release tiền     │   │
│  │  requestRefund()     — Hoàn tiền nếu dispute             │   │
│  │  mintCertificate()   — Mint NFT chứng nhận               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Logic thanh toán escrow + mint NFT certificate                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ deployed on
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  ⛓  TẦNG 5: BLOCKCHAIN (Ethereum Sepolia Testnet)               │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────┐ │
│  │ Transaction  │ │   Escrow     │ │    NFT     │ │  Event  │ │
│  │  Records     │ │   States     │ │ (ERC-721)  │ │  Logs   │ │
│  └──────────────┘ └──────────────┘ └────────────┘ └─────────┘ │
│  Lưu trữ giao dịch vĩnh viễn, bất biến, public & transparent   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Luồng dữ liệu chi tiết

| # | Bước | Chi tiết |
|---|---|---|
| **①** | User kết nối MetaMask | Frontend nhận wallet address từ MetaMask provider |
| **②** | Frontend gọi REST API | Backend tạo order mới trong MongoDB (status: `pending`) |
| **③** | Frontend gọi Smart Contract | Qua ethers.js gọi `createOrder(orderId)` + gửi ETH |
| **④** | Backend lắng nghe event | Event `OrderCreated` được emit → Backend cập nhật order status = `paid` |
| **⑤** | Smart Contract giữ Escrow | ETH được giữ trong contract, không ở buyer cũng không ở artist |
| **⑥** | Buyer xác nhận nhận tranh | Gọi `confirmDelivery()` → ETH chuyển cho Artist |
| **⑦** | Mint NFT Certificate | Smart Contract mint ERC-721 token → gửi cho Buyer làm chứng nhận |

---

## 5. Payment Flow — 5 Bước Thanh Toán Chi Tiết

### Bước 1: Buyer chọn tranh & Checkout

**Actor:** Frontend + Backend

Buyer duyệt gallery, chọn artwork, nhấn "Buy Now". Frontend gọi `POST /api/orders` để Backend tạo order mới trong MongoDB với status `pending`. Backend trả về `orderId` cùng thông tin thanh toán, Frontend hiển thị trang Payment với nút "Pay with MetaMask".

```javascript
// Backend: POST /api/orders
const order = new Order({
  orderId: generateId(),
  buyer: req.userId,
  artist: artwork.artistId,
  artworkId: artwork._id,
  amount: artwork.priceETH,
  status: "pending",       // off-chain
  txHash: null,
});
await order.save();
```

---

### Bước 2: Buyer thanh toán qua MetaMask

**Actor:** Frontend → Smart Contract

Buyer nhấn "Pay" → MetaMask popup yêu cầu xác nhận. Frontend dùng ethers.js gọi `contract.createOrder(orderId, artistAddress)` kèm ETH value. Smart Contract nhận ETH, lưu vào escrow mapping, emit event `OrderCreated`. Sau đó Frontend gửi `txHash` về Backend để cập nhật.

```javascript
// Frontend: ethers.js
const tx = await contract.createOrder(
  orderId,
  artistWalletAddress,
  { value: ethers.parseEther(priceETH) }
);
const receipt = await tx.wait();

// Update backend
await axios.patch('/api/orders/' + orderId, {
  txHash: receipt.hash,
  status: 'paid'
});
```

---

### Bước 3: Smart Contract giữ Escrow

**Actor:** Blockchain (Solidity)

ETH được giữ trong Smart Contract — không ở buyer, cũng không ở artist. Mapping `orderId → {buyer, artist, amount, status}` ghi nhận trạng thái. Không ai có thể rút tiền trừ khi đúng điều kiện. Artist tiến hành giao tranh vật lý cho buyer (off-chain).

```solidity
// Solidity Smart Contract
mapping(string => Escrow) public escrows;

struct Escrow {
    address buyer;
    address payable artist;
    uint256 amount;
    EscrowStatus status; // Created, Confirmed, Refunded
}

function createOrder(
    string memory orderId,
    address payable artist
) external payable {
    require(msg.value > 0, "Must send ETH");
    escrows[orderId] = Escrow(
        msg.sender,
        artist,
        msg.value,
        EscrowStatus.Created
    );
    emit OrderCreated(orderId, msg.sender, artist, msg.value);
}
```

---

### Bước 4: Buyer xác nhận nhận tranh → Release ETH + Mint NFT

**Actor:** Frontend → Smart Contract

Buyer nhận tranh vật lý, vào website nhấn "Confirm Received". Frontend gọi `contract.confirmDelivery(orderId)`. Smart Contract kiểm tra caller là buyer, chuyển ETH từ escrow sang Artist wallet, đồng thời mint NFT Certificate of Authenticity (ERC-721) gửi cho Buyer.

```solidity
// Solidity
function confirmDelivery(string memory orderId) external {
    Escrow storage e = escrows[orderId];
    require(msg.sender == e.buyer, "Only buyer");
    require(e.status == EscrowStatus.Created, "Invalid status");

    e.status = EscrowStatus.Confirmed;
    e.artist.transfer(e.amount);    // Release ETH to artist

    // Mint NFT Certificate of Authenticity
    uint256 tokenId = _nextTokenId++;
    _mint(e.buyer, tokenId);

    emit DeliveryConfirmed(orderId);
    emit CertificateMinted(orderId, e.buyer, tokenId);
}
```

---

### Bước 5: Hoàn tiền (Dispute / Refund)

**Actor:** Smart Contract

Nếu artist không giao tranh trong thời hạn, Buyer gọi `contract.requestRefund(orderId)`. Smart Contract kiểm tra deadline đã qua, hoàn ETH cho buyer. Không mint NFT — giao dịch bị hủy.

```solidity
// Solidity
function requestRefund(string memory orderId) external {
    Escrow storage e = escrows[orderId];
    require(msg.sender == e.buyer, "Only buyer");
    require(e.status == EscrowStatus.Created, "Invalid status");
    require(block.timestamp > e.deadline, "Deadline not passed");

    e.status = EscrowStatus.Refunded;
    payable(e.buyer).transfer(e.amount);

    emit OrderRefunded(orderId);
}
```

---

### Tóm tắt luồng thanh toán

```
Buyer chọn tranh → Tạo Order (DB) → Pay ETH → Escrow → Artist giao tranh → Confirm → Release ETH → Mint NFT Cert
```

---

## 6. Vì sao KHÔNG lưu tất cả lên Blockchain?

### 💸 1. Chi phí Gas quá cao

Mỗi thao tác ghi lên blockchain đều tốn gas fee. Lưu 1KB data trên Ethereum có thể tốn hàng chục USD. Nếu lưu ảnh tranh (vài MB), thông tin user, chat messages... chi phí sẽ phi thực tế. Với đồ án sinh viên trên Sepolia Testnet thì không tốn tiền thật, nhưng khi deploy mainnet sẽ là vấn đề lớn.

### 🐌 2. Tốc độ cực chậm

Mỗi giao dịch blockchain cần khoảng 15-30 giây (Ethereum) để xác nhận. Nếu mọi thao tác (xem giỏ hàng, update profile, gửi tin nhắn) đều on-chain → UX cực tệ, user phải chờ rất lâu cho mỗi action đơn giản. Database trả kết quả trong milliseconds.

### 🔒 3. Dữ liệu KHÔNG THỂ xóa hoặc sửa

Blockchain là immutable (bất biến). Nếu user muốn đổi email, xóa tin nhắn, sửa mô tả tranh → KHÔNG THỂ LÀM ĐƯỢC trên blockchain. Điều này vi phạm GDPR (quyền được quên — right to be forgotten) và không phù hợp với dữ liệu cần thay đổi thường xuyên.

### 👁 4. Vấn đề quyền riêng tư

Public blockchain = BẤT KỲ AI CŨNG CÓ THỂ XEM. Địa chỉ nhà giao hàng, số điện thoại, email, lịch sử mua hàng chi tiết, nội dung chat... nếu lưu on-chain thì hoàn toàn public, bất kỳ ai cũng đọc được. Vi phạm nghiêm trọng quyền riêng tư của người dùng.

### 📦 5. Giới hạn dung lượng

Smart Contract có giới hạn kích thước (24KB cho contract bytecode trên Ethereum). Ảnh tranh HD (vài MB mỗi tấm), hàng nghìn reviews, chat history... không thể và không nên lưu trên blockchain. Off-chain storage (MongoDB, S3...) xử lý tốt hơn nhiều.

---

## 7. Lý do phân tách kiến trúc & Mô hình Hybrid

> **Nguyên tắc vàng:** Chỉ đưa lên blockchain những gì THỰC SỰ CẦN tính minh bạch và bất biến.

### Payment & Escrow → On-chain

Đây là phần **CẦN TRUST** nhất trong hệ thống. Buyer cần biết chắc tiền đang được giữ an toàn, không ai có thể lấy trộm. Smart Contract đóng vai trò "trọng tài trung lập" (trusted third party) thay thế bên thứ 3 truyền thống (ngân hàng, PayPal...). Logic escrow đảm bảo tiền chỉ chuyển cho artist khi buyer xác nhận nhận tranh — bảo vệ quyền lợi cả hai bên.

### NFT Certificate → On-chain

Chứng nhận nguồn gốc tranh (Certificate of Authenticity) cần tồn tại vĩnh viễn và không thể giả mạo. Đây là **điểm đặc biệt nhất** của kiến trúc: liên kết tranh vật lý với digital proof trên blockchain. Mỗi NFT chứa metadata gồm `artworkId`, `artist address`, `buyer address`, `timestamp` — tạo thành "hộ chiếu" cho tác phẩm nghệ thuật.

### Mọi thứ khác → Off-chain

User profile, artwork listing, gallery, cart, chat, reviews... không cần trustless, nhưng cần nhanh, rẻ, linh hoạt, và đảm bảo riêng tư. MongoDB + Express + JWT xử lý tốt hơn blockchain trong mọi tiêu chí này. Backend cũng đóng vai trò trung gian — lắng nghe events từ blockchain để đồng bộ trạng thái giữa on-chain và off-chain.

---

### Mô hình Hybrid: Best of Both Worlds

| Off-chain (~90% data) | On-chain (~10% data) | Kết nối |
|---|---|---|
| Tốc độ cao | Minh bạch | Backend lắng nghe |
| Linh hoạt (CRUD) | Bất biến | event từ blockchain, |
| Riêng tư | Trustless | đồng bộ 2 hệ thống |
| Chi phí thấp | Không cần bên thứ 3 | (Event-driven |
| Dung lượng lớn | Chứng nhận vĩnh viễn | architecture) |

---

> **Kết luận:** Kiến trúc Hybrid On-chain/Off-chain là cách tiếp cận phổ biến nhất trong các dApp thực tế. Nó tận dụng sức mạnh của blockchain cho phần payment (trustless, transparent) đồng thời giữ mọi thứ khác trên hệ thống truyền thống để đảm bảo performance, privacy, và chi phí hợp lý. Đối với đồ án sinh viên, scope này vừa đủ để demonstrate được kiến thức blockchain mà không quá phức tạp, đồng thời có điểm đặc biệt (Escrow + NFT Certificate) để tạo ấn tượng.
