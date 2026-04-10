# BÁO CÁO TRANG LIVE AUCTION

## 1. Giới thiệu trang

### 1.1. Mục đích của trang Live Auction
Trang `Live Auction` được xây dựng để trình bày danh sách các tác phẩm đang tham gia đấu giá theo một giao diện trực quan, dễ theo dõi và có thể thao tác nhanh. Người dùng có thể xem thông tin cơ bản của từng phiên đấu giá như tên tác phẩm, mức giá hiện tại, trạng thái đấu giá và ảnh đại diện trước khi đi sâu vào trang chi tiết.

### 1.2. Vai trò của trang trong hệ thống
Trong hệ thống Artium, `Live Auction` đóng vai trò là điểm truy cập tập trung cho nghiệp vụ đấu giá ở phía frontend. Đây là nơi kết nối giữa dữ liệu tác phẩm, trải nghiệm khám phá của người mua và luồng điều hướng sang trang chi tiết tác phẩm. Trang này cũng góp phần thể hiện định hướng marketplace kết hợp yếu tố sưu tầm số và blockchain provenance của hệ thống.

### 1.3. Đối tượng người dùng sử dụng trang
Các nhóm người dùng chính của trang gồm:

- Người mua hoặc nhà sưu tầm muốn theo dõi các tác phẩm đang mở đấu giá.
- Người dùng đang khám phá hệ thống Artium và cần một trang tổng hợp các phiên đấu giá nổi bật.
- Quản trị viên, giảng viên hoặc thành viên nhóm phát triển cần kiểm tra cách hiển thị và tổ chức dữ liệu đấu giá trên giao diện.

## 2. Giao diện và bố cục trang

### 2.1. Cấu trúc tổng thể của trang
Trang `Live Auction` được tổ chức theo mô hình một trang marketing có phần giới thiệu đầu trang, khu vực bộ lọc, danh sách kết quả và phân trang ở cuối. Bố cục ưu tiên khả năng đọc nhanh, so sánh nhiều tác phẩm cùng lúc và hỗ trợ tốt cho cả màn hình desktop lẫn mobile.

### 2.2. Header, main content, footer
Trang được khai báo nội dung chính tại `FE/artium-web/src/views/LiveAuctionPage.tsx` và được gắn vào route `FE/artium-web/src/pages/auction.tsx`.

- `Header`: sử dụng `SiteHeader`, đồng bộ với các trang marketing khác trong hệ thống.
- `Main content`: hiển thị tiêu đề `Live Auctions`, mô tả trang, bộ lọc, danh sách tác phẩm và điều khiển phân trang.
- `Footer`: sử dụng `SiteFooter`, giúp trang thống nhất về bố cục tổng thể với các phần còn lại của website.

### 2.3. Khu vực bộ lọc và điều khiển hiển thị
Khu vực điều khiển nằm gần đầu nội dung, bao gồm:

- Bộ lọc theo `Category`.
- Bộ lọc theo `Status`.
- Bộ lọc khoảng giá theo ETH.
- Nút chuyển đổi chế độ xem `Grid` và `List`.
- Nút `Clear Filters` để đưa trang về trạng thái mặc định.
- Trên mobile, các bộ lọc được gom vào một panel riêng để tối ưu diện tích hiển thị.

Thiết kế này giúp người dùng vừa có thể thu hẹp dữ liệu theo tiêu chí mong muốn, vừa có thể đổi cách quan sát danh sách tác phẩm tùy theo nhu cầu.

### 2.4. Khu vực danh sách auction lots
Danh sách `auction lots` là phần nội dung trung tâm của trang. Mỗi lot được hiển thị dưới dạng card hoặc hàng danh sách tùy theo chế độ xem. Một lot bao gồm:

- Ảnh đại diện tác phẩm.
- Trạng thái phiên đấu giá.
- Tên tác phẩm.
- Liên kết xem chi tiết tác phẩm.
- Giá hiện tại được hiển thị theo đơn vị ETH.
- Nút hành động chính như `Place Bid`, `Enter Auction`, `View Artwork` hoặc `View Results`.

### 2.5. Khu vực phân trang
Thay vì cơ chế `Load More`, trang hiện dùng `Pagination`. Mỗi trang hiển thị tối đa `24` kết quả. Phần điều hướng gồm:

- Nút `Previous`.
- Danh sách số trang.
- Nút `Next`.
- Dòng trạng thái phía dưới cho biết đang ở trang nào và tổng số kết quả phù hợp.

Thiết kế này giúp người dùng dễ định vị vị trí của mình trong toàn bộ tập dữ liệu, đặc biệt khi số lượng lot tăng lên.

## 3. Dữ liệu hiển thị trên trang

### 3.1. Nguồn dữ liệu sử dụng
Trang hiện sử dụng dữ liệu từ `mockArtworks` tại domain `discover`, nhưng không lấy toàn bộ danh sách để hiển thị như trước. Thay vào đó, mỗi artwork có thể được gắn thêm metadata `auction` để xác định tác phẩm nào thực sự thuộc miền đấu giá. `Live Auction` chỉ render những artwork có dữ liệu `auction`, trong khi `Discover` vẫn tiếp tục dùng toàn bộ dataset artwork chung.

Cách tổ chức này cho phép tái sử dụng nguồn dữ liệu artwork dùng chung mà vẫn tách được ngữ nghĩa nghiệp vụ của trang đấu giá.

### 3.2. Cấu trúc dữ liệu của mỗi auction lot
Tại tầng giao diện, mỗi lot được ánh xạ về kiểu `AuctionLot` với các trường chính sau:

| Trường | Ý nghĩa |
| --- | --- |
| `artworkId` | Mã định danh tác phẩm, dùng để điều hướng sang trang chi tiết |
| `title` | Tên tác phẩm |
| `bidValue` | Giá hiện tại của phiên đấu giá dưới dạng số |
| `categoryKey` | Nhóm phân loại dùng cho bộ lọc |
| `status` | Chuỗi trạng thái hiển thị trên UI |
| `statusKey` | Mã trạng thái logic để lọc và ánh xạ hành động |
| `statusTone` | Tông hiển thị của trạng thái |
| `imageSrc` | Ảnh đại diện dùng để render card |
| `imageAlt` | Nội dung mô tả ảnh phục vụ accessibility |

Ngoài kiểu `AuctionLot` phục vụ render giao diện, dữ liệu gốc trong `mockArtworks` hiện còn có thêm lớp metadata `auction`, ví dụ:

| Trường | Ý nghĩa |
| --- | --- |
| `auction.statusKey` | Trạng thái của phiên đấu giá |
| `auction.statusLabel` | Nhãn hiển thị của trạng thái |
| `auction.currentBidEth` | Mức giá hiện tại của phiên đấu giá |

### 3.3. Cách tổ chức và ánh xạ dữ liệu lên giao diện
Quy trình tổ chức dữ liệu hiện tại gồm các bước:

1. Lấy danh sách `mockArtworks`.
2. Lọc ra những artwork có metadata `auction`.
3. Sắp xếp dữ liệu theo mức độ ưu tiên trạng thái, trong đó các auction đang hoạt động được đưa lên trước.
4. Ánh xạ từng phần tử sang `AuctionLot`.
5. Sinh `categoryKey` theo chu kỳ danh mục định sẵn.
6. Lấy `status`, `statusKey`, `statusTone` từ metadata `auction`.
7. Dùng `currentBidEth` làm nguồn giá hiện tại và định dạng lại sang chuỗi ETH khi render.
8. Đưa dữ liệu sau ánh xạ vào danh sách `lots` để phục vụ lọc, hiển thị và phân trang.

Điều này cho thấy trang đã được thiết kế theo hướng tách nguồn dữ liệu gốc và dữ liệu trình bày giao diện.

### 3.4. Ý nghĩa của việc tái sử dụng dữ liệu chung
Việc tái sử dụng `mockArtworks` mang lại các lợi ích sau:

- Giảm trùng lặp dữ liệu giữa trang `Discover` và `Live Auction`.
- Dễ bảo trì khi thay đổi cấu trúc dữ liệu chung.
- Tăng tính nhất quán của thông tin tác phẩm trên toàn hệ thống.
- Giữ được ranh giới nghiệp vụ nhờ lớp metadata `auction`, tránh việc mọi artwork của `Discover` đều bị hiểu là auction.
- Tạo tiền đề để thay dữ liệu mock bằng API thật trong tương lai với ít thay đổi ở tầng UI hơn.

## 4. Các chức năng chính của trang

### 4.1. Hiển thị danh sách phiên đấu giá
Trang hiển thị một tập hợp các lot được ánh xạ từ những artwork có metadata `auction`. Người dùng có thể xem nhanh trạng thái từng lot, giá hiện tại và hình ảnh đại diện của tác phẩm. Các auction đang hoạt động được ưu tiên hiển thị trước các trạng thái như `paused` hoặc `closed`.

### 4.2. Lọc dữ liệu theo tiêu chí
Trang hỗ trợ lọc theo ba nhóm tiêu chí chính:

- Danh mục tác phẩm.
- Trạng thái đấu giá.
- Khoảng giá ETH.

Khi người dùng thay đổi bộ lọc, danh sách hiển thị sẽ được tính lại thông qua hàm lọc dữ liệu, sau đó cập nhật số lượng kết quả tương ứng.

### 4.3. Chuyển đổi chế độ hiển thị
Người dùng có thể chuyển giữa hai chế độ:

- `Grid`: phù hợp để xem nhiều tác phẩm cùng lúc.
- `List`: phù hợp để đọc kỹ thông tin từng lot theo chiều dọc.

Việc chuyển đổi chỉ tác động đến cách render giao diện, không làm thay đổi dữ liệu gốc.

### 4.4. Phân trang kết quả
Trang chia dữ liệu sau lọc thành nhiều trang, mỗi trang tối đa `24` phần tử. Trạng thái trang hiện tại được lưu bằng `currentPage`. Khi thay đổi bộ lọc hoặc khoảng giá, trang sẽ tự động quay về trang đầu tiên để tránh hiển thị sai ngữ cảnh.

Ngoài việc chia dữ liệu theo trang, hệ thống còn bổ sung hành vi cuộn về đầu khu vực danh sách khi người dùng chuyển trang. Mục đích của cải tiến này là để người dùng nhìn thấy ngay phần tử đầu tiên của trang mới, tránh trường hợp vẫn đứng ở giữa danh sách cũ và nhầm rằng dữ liệu chưa thay đổi.

Hành vi cuộn được tinh chỉnh theo thiết bị:

- Trên mobile, giao diện cuộn rõ ràng hơn để người dùng nhìn thấy ngay item đầu tiên của trang mới.
- Trên desktop, giao diện chỉ cần cuộn về khu vực danh sách với một khoảng đệm phù hợp, tránh cảm giác nhảy quá mạnh lên đầu trang.

### 4.5. Điều hướng đến trang chi tiết tác phẩm
Mỗi lot có liên kết `View artwork details`, dẫn người dùng đến đường dẫn `/artworks/{artworkId}`. Đây là luồng điều hướng chính để người dùng xem thông tin đầy đủ của tác phẩm trước khi ra quyết định.

### 4.6. Hành động đặt giá đấu giá
Nút hành động của mỗi lot thay đổi theo trạng thái:

- `active`, `ending-soon`: hiển thị `Place Bid`.
- `newly-listed`: hiển thị `Enter Auction`.
- `paused`: hiển thị `View Artwork`.
- `closed`: hiển thị `View Results`.

Tuy nhiên, ở phiên bản hiện tại, các nút này vẫn đang cùng điều hướng tới trang chi tiết tác phẩm. Nghĩa là luồng đấu giá chuyên biệt chưa được tách riêng ở frontend, mà mới dừng ở mức điều hướng vào chi tiết để người dùng tiếp tục thao tác từ đó.

## 5. Luồng thao tác của người dùng

### 5.1. Luồng truy cập vào trang Live Auction
Người dùng truy cập trang thông qua route `/auction`. Route này render `LiveAuctionPage` bên trong layout có `SiteHeader` và `SiteFooter`, từ đó tạo trải nghiệm thống nhất với các trang khác.

### 5.2. Luồng sử dụng bộ lọc
Quy trình thao tác với bộ lọc diễn ra như sau:

1. Người dùng mở bộ lọc theo danh mục, trạng thái hoặc khoảng giá.
2. Chọn giá trị mong muốn.
3. Hệ thống cập nhật điều kiện lọc.
4. Danh sách lot được tính lại.
5. Trang hiện tại được đưa về `1`.
6. Giao diện hiển thị lại số lượng kết quả phù hợp.

Trên mobile, thao tác này diễn ra trong panel lọc riêng rồi mới áp dụng vào màn hình chính.

### 5.3. Luồng chuyển đổi Grid/List
Người dùng bấm vào biểu tượng `Grid` hoặc `List`. Hệ thống cập nhật state `viewMode` và render lại danh sách bằng bố cục mới, trong khi tập dữ liệu đang lọc vẫn được giữ nguyên.

### 5.4. Luồng phân trang
Người dùng có thể:

- Bấm `Previous` để quay lại trang trước.
- Bấm số trang để đến trang cụ thể.
- Bấm `Next` để sang trang tiếp theo.

Hệ thống tính lại vị trí bắt đầu của dữ liệu và chỉ render phần tử thuộc trang hiện tại. Sau khi chuyển trang, giao diện tự động cuộn về đầu section danh sách để người dùng thấy ngay nội dung mới. Cách xử lý này giúp hạn chế nhầm lẫn về trạng thái dữ liệu, đặc biệt trên màn hình mobile nơi phần phân trang thường nằm khá xa item đầu tiên của trang kế tiếp.

### 5.5. Luồng bấm View artwork details
Khi bấm `View artwork details`, người dùng được chuyển đến trang chi tiết của tác phẩm tương ứng. Từ đây, họ có thể xem thêm thông tin, hình ảnh, tác giả và các thao tác nghiệp vụ khác nếu hệ thống hỗ trợ.

### 5.6. Luồng bấm Place Bid
Ở trạng thái hiện tại của frontend, khi người dùng bấm `Place Bid`, hệ thống vẫn điều hướng tới trang chi tiết tác phẩm thay vì mở trực tiếp màn hình đặt giá. Điều này có thể xem là một bước trung gian trước khi triển khai đầy đủ luồng bid thực tế.

## 6. Thay đổi và cải tiến đã thực hiện

### 6.1. Chuyển từ dữ liệu mock cứng sang nguồn dữ liệu dùng chung
Ban đầu, trang sử dụng một danh sách `lots` hardcode ngay trong file giao diện. Cách làm này nhanh cho giai đoạn demo nhưng khó bảo trì. Phiên bản hiện tại đã chuyển sang lấy dữ liệu từ `mockArtworks`, sau đó chỉ chọn những artwork có metadata `auction` để ánh xạ lại thành `AuctionLot`. Đây là cải tiến quan trọng về tính tái sử dụng và khả năng đồng bộ dữ liệu, đồng thời tránh việc toàn bộ artwork của `Discover` bị hiển thị nhầm như auction.

### 6.2. Chuyển từ cơ chế Load More sang Pagination
Phiên bản trước dùng biến `visibleCount` và nút `Load More Results` để tăng dần số lượng phần tử hiển thị. Phiên bản hiện tại thay bằng `currentPage` và hệ thống phân trang đầy đủ. Cải tiến này giúp:

- Kiểm soát tốt hơn khi số lượng dữ liệu lớn.
- Dễ theo dõi vị trí của người dùng trong tập kết quả.
- Cải thiện trải nghiệm khi đổi trang nhờ tự động cuộn về đầu danh sách.
- Dễ mở rộng sang backend paging trong tương lai.

### 6.3. Đồng bộ layout với footer chung của hệ thống
Route `auction` đã được cập nhật để sử dụng `SiteFooter` giống các trang chung khác. Điều này giúp bố cục trang thống nhất hơn, tăng tính hoàn chỉnh về mặt giao diện và trải nghiệm điều hướng toàn site.

### 6.4. Cải thiện tính nhất quán và khả năng mở rộng
Những thay đổi gần đây giúp trang:

- Đồng bộ hơn với kiến trúc giao diện chung.
- Dễ chuyển từ mock data sang API thật.
- Phân tách rõ hơn giữa dữ liệu artwork chung và dữ liệu nghiệp vụ auction.
- Dễ bảo trì khi thay đổi số lượng lot hoặc tiêu chí lọc.
- Giảm việc lặp lại dữ liệu và logic trình bày.

## 7. Đánh giá

### 7.1. Ưu điểm của thiết kế hiện tại
Thiết kế hiện tại có các ưu điểm nổi bật:

- Giao diện rõ ràng, hiện đại, phù hợp với ngữ cảnh trưng bày đấu giá nghệ thuật.
- Có đầy đủ các thao tác frontend quan trọng: lọc, đổi chế độ xem, phân trang, điều hướng.
- Trải nghiệm phân trang rõ ràng hơn vì người dùng thấy ngay item đầu của page mới sau khi chuyển trang.
- Tái sử dụng được dữ liệu từ domain khác thay vì hardcode riêng.
- Chỉ những artwork có metadata `auction` mới xuất hiện trên trang, nên logic dữ liệu hợp lý hơn.
- Có hỗ trợ responsive với luồng bộ lọc riêng cho mobile.
- Bố cục đã đồng bộ hơn với hệ thống nhờ `SiteHeader` và `SiteFooter`.

### 7.2. Hạn chế hiện tại
Một số hạn chế hiện tại gồm:

- Dữ liệu vẫn là mock data, chưa lấy từ API hoặc dữ liệu blockchain thật.
- Metadata `auction` vẫn đang là dữ liệu giả lập ở frontend, chưa lấy từ service đấu giá thật.
- Nút `Place Bid` chưa mở luồng bid riêng mà vẫn dẫn đến trang chi tiết tác phẩm.
- Chưa có realtime update cho giá đấu hoặc thời gian còn lại.
- Chưa có cơ chế đồng bộ trực tiếp với hợp đồng thông minh hoặc backend auction service.

### 7.3. Khả năng mở rộng trong tương lai
Trang có thể được mở rộng theo các hướng sau:

- Kết nối API thật để lấy danh sách phiên đấu giá đang diễn ra.
- Hỗ trợ sắp xếp theo giá, thời gian kết thúc hoặc mức độ nổi bật.
- Tách riêng trang hoặc modal đặt giá trực tiếp.
- Đồng bộ trạng thái theo thời gian thực qua WebSocket hoặc event stream.
- Kết nối dữ liệu on-chain để hiển thị giá đấu và lịch sử bid minh bạch hơn.

## 8. Kết luận

### 8.1. Tóm tắt kết quả xây dựng trang
Trang `Live Auction` đã được xây dựng như một màn hình đấu giá hoàn chỉnh ở mức frontend demo, bao gồm các thành phần cốt lõi như hiển thị danh sách lot, lọc dữ liệu, đổi chế độ xem, phân trang và điều hướng sang trang chi tiết tác phẩm. Đồng thời, trang cũng đã được cải tiến theo hướng nhất quán hơn với kiến trúc chung của hệ thống.

### 8.2. Ý nghĩa của trang Live Auction trong toàn hệ thống
`Live Auction` là thành phần quan trọng giúp Artium mở rộng từ một nền tảng trưng bày và giao dịch tác phẩm sang mô hình đấu giá số. Trang này không chỉ mang ý nghĩa giao diện mà còn là nền tảng để tích hợp các nghiệp vụ nâng cao như realtime bidding, dữ liệu blockchain và xác thực provenance trong các giai đoạn phát triển tiếp theo.

---

## Ghi chú

- Báo cáo này được viết dựa trên hiện trạng triển khai của `FE/artium-web/src/views/LiveAuctionPage.tsx`.
- Phần layout route được đối chiếu với `FE/artium-web/src/pages/auction.tsx`.
- Nội dung phản ánh đúng trạng thái frontend hiện tại, bao gồm cả các điểm đã hoàn thành và các phần còn đang ở mức giả lập hoặc chuẩn bị mở rộng.
