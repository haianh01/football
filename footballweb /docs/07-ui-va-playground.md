# 07. Giao Diện Và Playground

## Tổng quan route frontend

### `/`

Landing page giải thích hướng sản phẩm:

- quản lý đội trước
- marketplace sau
- nhấn mạnh use case kèo gấp

### `/urgent-posts`

Trang public mô phỏng danh sách kèo gấp.

### `/fields`

Trang public mô phỏng danh sách sân bóng.

### `/dashboard`

Dashboard demo định hướng sản phẩm, chưa phải dashboard động đầy đủ.

### `/test-doi-truong`

Đây là route quan trọng nhất để test tay dự án hiện tại.

## Playground `/test-doi-truong` dùng để làm gì

Trang này là UI thao tác tay với backend thật. Nó giúp test flow mà không cần Postman.

Hiện có các nhóm chức năng:

- tạo user
- tạo đội
- thêm thành viên
- bổ nhiệm đội trưởng
- tải lại chi tiết đội
- sửa đội
- tạo trận
- sửa trận
- đăng kèo gấp
- sửa kèo gấp
- apply vào kèo
- accept hoặc reject ứng viên
- xem danh sách entity đã tạo
- xem log response HTTP
- chạy auto test quyền đội trưởng

## Mẹo dùng nhanh

Luồng test thủ công khuyến nghị:

1. tạo 2 hoặc 3 user
2. tạo đội với 1 user làm đội trưởng
3. thêm user khác vào đội với role `member`
4. tạo trận cho đội
5. đăng bài kèo gấp từ trận vừa tạo
6. cho một user apply
7. dùng captain accept hoặc reject
8. thử dùng member sửa đội hoặc duyệt kèo để xác nhận bị `403`

## Những gì có thể test trực tiếp trên UI

### Tạo user

Dùng để có `id` user thật trong DB.

### Tạo đội

Chọn:

- tên đội
- slug
- thành phố
- quận
- mô tả
- trình độ
- user làm đội trưởng

### Thêm thành viên

Chọn:

- đội
- actor là captain
- user được thêm
- role mới của user

Flow khuyến nghị:

- thêm user vào đội với role `member` hoặc `manager`
- nếu cần giao quyền captain, dùng form bổ nhiệm riêng

### Bổ nhiệm đội trưởng

Chọn:

- đội
- captain đang thao tác
- thành viên sẵn có trong đội

Form này gọi endpoint đổi role thành `captain`.

### Tạo trận

Chọn:

- đội
- captain tạo trận
- tiêu đề
- thời gian bắt đầu, kết thúc
- quận
- trạng thái
- ghi chú

### Đăng kèo gấp

Chọn:

- trận
- đội
- captain thao tác
- số người cần
- skill level
- fee share
- mô tả
- thời hạn hết hạn

### Sửa đội, sửa trận, sửa kèo gấp

Trong các list bên dưới có nút:

```text
Nạp vào form sửa
```

Dùng nút này để đổ dữ liệu hiện có lên form, rồi sửa và submit.

### Duyệt ứng viên

Chọn:

- post
- application
- captain thao tác
- hành động `accept` hoặc `reject`

## Nhật ký thao tác

Playground có phần log để hiện:

- action label
- HTTP status
- response body tóm tắt

Phần này rất hữu ích khi debug nhanh UI với API.

## Auto test quyền đội trưởng

Ngoài form tay, trang này còn có kịch bản auto:

- tạo captain
- tạo member
- tạo applicant
- tạo team
- thêm member
- thử cho member sửa đội và xác nhận `403`
- thử cho member tạo trận hoặc tạo post và xác nhận `403`
- cho captain thao tác cùng flow và xác nhận `200` hoặc `201`

## Giới hạn của playground

- không phải giao diện production
- state chỉ giữ trong phiên tab hiện tại
- chưa có login thật
- chưa có session
- chưa có upload file

## Khi nào nên dùng playground này

- verify API mới viết
- debug logic permission
- demo nhanh flow cho người khác
- regression test thủ công trước khi tách sang UI production
