# Commerce

## 1. Mục tiêu module

Commerce không nên hoạt động như một shop tách biệt. Nó phải bám theo hành vi bóng đá thực tế và xuất hiện đúng ngữ cảnh.

## 2. Phạm vi chức năng

- bán giày, áo, phụ kiện
- bán combo ngày thi đấu
- in áo đội
- upsell sau khi chốt trận
- upsell sau khi vote tham gia giải
- theo dõi đơn hàng

## 3. Màn hình cần có

### 3.1 Trang cửa hàng

- danh mục sản phẩm
- sản phẩm hot
- combo theo use case
- dịch vụ đội bóng

### 3.2 Chi tiết sản phẩm

- ảnh
- giá
- biến thể
- tồn kho
- gợi ý mua kèm

### 3.3 Giỏ hàng và checkout

- sản phẩm
- số lượng
- ghi chú
- địa chỉ nhận
- phương thức thanh toán

### 3.4 Đơn hàng

- trạng thái đơn
- lịch sử mua
- mua lại

## 4. Ngữ cảnh upsell nên hỗ trợ

- sau khi chốt kèo: nước điện giải, băng quấn, tất
- sau khi vote áo đội: dịch vụ in áo
- trước ngày đá giải: combo hồi phục và phụ kiện

## 5. Bổ sung còn thiếu từ HTML

Khối store trong các HTML mới chỉ đóng vai trò showcase. Để thành module thật cần thêm:

- danh mục sản phẩm rõ ràng
- CTA xem chi tiết và thêm vào giỏ
- gợi ý mua theo ngữ cảnh trận đấu
- dịch vụ dành riêng cho đội bóng, không chỉ sản phẩm lẻ
- đơn hàng và trạng thái giao hàng

## 6. Thực thể dữ liệu

### Product

- id
- name
- category
- price
- compare_at_price
- stock
- images
- tags
- related_contexts

### Order

- id
- user_id
- team_id
- total_amount
- status
- created_at

### OrderItem

- id
- order_id
- product_id
- quantity
- unit_price

## 7. KPI module

- tỷ lệ chuyển đổi từ home sang store
- tỷ lệ mua sau khi chốt trận
- giá trị đơn hàng trung bình
- tỷ lệ mua lại
