# Các điểm đã sửa trong Smart Contract để khớp với Test Case

Dựa vào phân tích giữa file Smart Contract `ArtAuctionEscrow.sol` và các tài liệu Test Plan/Edge Cases, mình đã thực hiện 2 thay đổi chính yếu để vá lỗ hổng bảo mật nhằm đáp ứng các bài test:

## 1. Vá lỗ hổng giả mạo người bán (Khớp với nhận xét trong Test Plan TC-01, TC-02)

- **Vấn đề:** Trong phiên bản trước, hàm `createAuction` nhận tham số `seller` từ bên ngoài: `function createAuction(string memory orderId, address payable seller, uint256 duration)`. Điều này cho phép bất kỳ ai cũng có thể truyền vào một địa chỉ `seller` rác/phòng hờ để tạo ra một phiên đấu giá giả mạo nhằm chiếm dụng `orderId`.
- **Cách sửa:**
  - Xóa bỏ tham số `seller` khỏi chữ ký hàm.
  - Gán tự động `seller: payable(msg.sender)` trong quá trình tạo `Auction`. Người gọi hàm (caller) bắt buộc phải là người bán thực tế của phiên đấu giá đó.
- **Mã nguồn đã đổi:**

```solidity
// TRƯỚC KHI SỬA
function createAuction(string memory orderId, address payable seller, uint256 duration) external {
    require(seller != address(0), "Auction: Invalid seller address");
    // ...
    auctions[orderId] = Auction({
        seller: seller,
        // ...
    });
}

// SAU KHI SỬA
function createAuction(string memory orderId, uint256 duration) external {
    // ...
    auctions[orderId] = Auction({
        seller: payable(msg.sender), // Tự động lấy định danh ví tạo giao dịch
        // ...
    });
}
```

## 2. Vá lỗ hổng người bán tự đẩy giá ảo (Khớp với Test Plan TC-12)

- **Vấn đề:** (Self-bidding / Shill Bidding). Contract cũ không cấm người bán gọi hàm `bid` trên chính phiên đấu giá của họ. Người bán có thể lợi dụng điều này để đẩy giá lên cao, bắt ép người mua thật phải trả nhiều tiền hơn.
- **Cách sửa:** Bổ sung thêm điều kiện kiểm tra (require) trong hàm `bid()` để khóa địa chỉ của `seller` không cho phép tham gia đặt giá.
- **Mã nguồn đã đổi:**

```solidity
// THÊM DÒNG KIỂM TRA VÀO HÀM bid()
function bid(string memory orderId) external payable nonReentrant {
    Auction storage auction = auctions[orderId];
    // ... (các điều kiện kiểm tra khác)

    // NEW: Chặn người bán không được quyền đặt giá
    require(msg.sender != auction.seller, "Auction: Seller cannot bid");

    // ...
}
```
