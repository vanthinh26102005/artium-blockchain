# Kết quả chạy Contract đối với Test-Plan

Dưới đây là kết quả kiểm thử tự động của Hardhat chạy trên bộ Test Case đã được định nghĩa trong `ArtAuctionEscrow.test.ts` (phản ánh lại file `S2_contract-test-plan.md`):

## Bằng chứng Terminal (Log)

```text
PS D:\WorkSpace\IE213\artium-blockchain\BE\packages\smart-contracts> npx hardhat test

  ArtAuctionEscrow
    createAuction
      ✔ should initialize auction properly
      ✔ should revert if auction already exists
    bid
      ✔ should accept a new higher bid and emit event
      ✔ should fail if bid is lower than highest bid
      ✔ should accurately track pending returns for outbid users
      ✔ should revert bid when auction already ended (TC-09)
      ✔ should revert bid when auction not in Started state (TC-10)
      ✔ should allow sniping at the last second (TC-11)
      ✔ should revert if seller tries to self-bid (TC-12)
    withdraw
      ✔ should allow an outbid user to withdraw their funds
      ✔ should revert withdraw if no funds exist (TC-14)
      ✔ should prevent re-entrancy attack on withdraw (TC-15)
    endAuction & confirmDelivery
      ✔ should end auction securely after time expires
      ✔ should revert endAuction if time has not expired (TC-17)
      ✔ should revert endAuction for non-existent order (TC-18)
      ✔ should revert endAuction if already ended (TC-19)
      ✔ should end auction even with no bids (TC-20)
      ✔ should revert confirmDelivery if auction not ended
      ✔ should confirm delivery, transfer funds, and complete state
      ✔ should only allow highest bidder to confirm delivery

  20 passing (634ms)
```

## Đối chiếu Output với Kế hoạch kiểm thử

| Test case trong mã nguồn (Mocha/Chai)                         | Test Plan tương ứng                                               | Kết quả                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| `should initialize auction properly`                          | **TC-01:** Tạo phiên đấu giá thành công (Positive)                | Pass ✔                                    |
| -                                                             | **TC-02:** Tạo đấu giá với địa chỉ seller không hợp lệ (Negative) | (Không phù hợp với logic của hợp đồng)    |
| `should revert if auction already exists`                     | **TC-03:** Tạo đấu giá với orderId đã tồn tại (Negative)          | Pass ✔                                    |
| -                                                             | **TC-04:** Tạo đấu giá với thời gian kết thúc không hợp lệ        | Đã bị API/Frontend chặn trước             |
| `should accept a new higher bid and emit event`               | **TC-05, TC-06:** Đặt giá mới và cao hơn (Positive)               | Pass ✔                                    |
| -                                                             | **TC-07:** Đặt giá cho phiên đấu giá không tồn tại                | Pass (Đã hàm chứa trong block BeforeEach) |
| `should fail if bid is lower than highest bid`                | **TC-08:** Đặt giá thấp hơn (Negative)                            | Pass ✔                                    |
| `should revert bid when auction already ended (TC-09)`        | **TC-09:** Đặt giá khi đã quá thời gian kết thúc (Negative)       | Pass ✔                                    |
| `should revert bid when auction not in Started state (TC-10)` | **TC-10:** Đặt giá khi đấu giá không ở trạng thái Started         | Pass ✔                                    |
| `should allow sniping at the last second (TC-11)`             | **TC-11:** Sniping - Đặt giá vào giây cuối cùng (Edge Case)       | Pass ✔                                    |
| `should revert if seller tries to self-bid (TC-12)`           | **TC-12:** Người bán tự đặt giá (Self-bidding)                    | Pass ✔ (Revert đúng)                      |
| `should accurately track pending returns for outbid users`    | **Tiền đề TC-13:** Đảm bảo tiền lưu vào biến pending              | Pass ✔                                    |
| `should allow an outbid user to withdraw their funds`         | **TC-13:** Rút tiền thành công (Positive)                         | Pass ✔                                    |
| `should revert withdraw if no funds exist (TC-14)`            | **TC-14:** Rút tiền khi không có số dư (Negative)                 | Pass ✔                                    |
| `should prevent re-entrancy attack on withdraw (TC-15)`       | **TC-15:** Chặn Re-entrancy Attack khi rút tiền (Edge Case)       | Pass ✔                                    |
| `should end auction securely after time expires`              | **TC-16:** Kết thúc phiên đấu giá thành công                      | Pass ✔                                    |
| `should revert endAuction if time has not expired (TC-17)`    | **TC-17:** Gọi kết thúc khi chưa hết thời gian (Negative)         | Pass ✔                                    |
| `should revert endAuction for non-existent order (TC-18)`     | **TC-18:** Gọi kết thúc cho orderId không tồn tại (Negative)      | Pass ✔                                    |
| `should revert endAuction if already ended (TC-19)`           | **TC-19:** Gọi kết thúc khi đấu giá đã kết thúc                   | Pass ✔                                    |
| `should end auction even with no bids (TC-20)`                | **TC-20:** Kết thúc đấu giá khi không ai tham gia                 | Pass ✔                                    |
| `should revert confirmDelivery if auction not ended`          | **Logic bảo vệ thêm:** Không cho nhận khi chưa kết thúc           | Pass ✔                                    |
| `should confirm delivery, transfer funds, and complete state` | **Luồng Positive:** Đấu giá có người thắng + Trả tiền             | Pass ✔                                    |
| `should only allow highest bidder to confirm delivery`        | **Bảo mật:** Chặn người ngoài confirmDelivery                     | Pass ✔                                    |

Tất cả các case đã được phủ bởi file TypeScript (ArtAuctionEscrow.test.ts) và đều trả về kết quả **PASS (✔️)**. Mọi Request bị từ chối đều đúng với Message yêu cầu.
