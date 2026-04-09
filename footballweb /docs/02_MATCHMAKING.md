# Matchmaking

## 1. Mục tiêu module

Giúp đội bóng tìm đối nhanh, lọc đúng khu vực và giảm rủi ro bùng kèo bằng lớp trust rõ ràng.

## 2. Chức năng chính

- đăng kèo tìm đối
- lọc danh sách kèo
- xem chi tiết kèo
- xem uy tín đội đối diện
- gửi lời mời hoặc nhận kèo
- chốt trận
- quản lý kèo đã đăng

## 3. Màn hình chính

### 3.1 Danh sách kèo

Phải có:

- search theo tên đội, sân, khu vực
- filter chips
- sort
- cards
- map explorer tùy chọn

### 3.2 Chi tiết kèo

Khối bắt buộc:

- thông tin trận
- hồ sơ đội đăng kèo
- trust metrics
- lịch sử trận gần đây
- điều kiện chia sân / hỗ trợ
- CTA gửi lời mời hoặc liên hệ

### 3.3 Đăng kèo

Fields:

- đội đăng
- ngày
- giờ
- khu vực
- sân cụ thể
- loại sân 5/7/11
- trình độ mong muốn
- phí sân
- ghi chú phong cách đá
- yêu cầu đặc biệt

### 3.4 Quản lý kèo

- kèo đang mở
- kèo đã chốt
- kèo đã hủy
- lịch sử đối thủ

## 4. Filters chuẩn nghiệp vụ

### Bộ lọc nhanh

- quận / huyện
- khung giờ vàng 17h-21h
- hôm nay / ngày mai / cuối tuần
- sân 5 / sân 7 / sân 11
- có sân sẵn / chưa có sân
- trình độ

### Bộ lọc nâng cao

- mức chia sân
- có hỗ trợ nước / phí
- đội uy tín từ mức nào
- loại trận: giao lưu, tập chiến thuật, giải mini
- trạng thái gấp
- đăng gần đây

## 5. Sort bắt buộc

- gần tôi
- sắp đá
- mới đăng
- uy tín cao
- phù hợp nhất

## 6. Cấu trúc card kèo

### Thông tin phải có

- logo đội
- tên đội
- giờ đá
- địa điểm
- loại sân
- trình độ
- điều kiện phí
- trạng thái bài đăng

### Trust layer bắt buộc

Không chỉ dùng badge `Gold/Silver/New`. Card cần hiển thị:

- điểm uy tín tổng
- số trận đã xác thực
- tỷ lệ giữ kèo
- tỷ lệ đúng giờ

Ví dụ:

- `Uy tín 97%`
- `42 trận`
- `Giữ kèo 95%`

## 7. CTA đúng nghiệp vụ

Không nên dùng `Nhận kèo ngay` cho mọi card vì quyết định này quá sớm. Nên có logic:

- card list: `Xem chi tiết`
- nếu đã đủ trust và quan hệ trước đó: `Gửi lời mời`
- trong detail page mới có `Chốt kèo`

## 8. Bổ sung còn thiếu từ HTML trang tìm đối

Các bản HTML đã có layout tốt nhưng còn thiếu:

- sort bar
- filter theo uy tín
- filter có sân sẵn / chia sân
- trust metrics dạng số
- CTA đúng theo bước
- FAB rõ nghĩa: `Đăng kèo`
- trạng thái xử lý sau khi gửi lời mời

## 9. Flow chính

### Flow tìm đối

1. User vào list
2. Search hoặc filter
3. So sánh card
4. Mở chi tiết
5. Xem trust
6. Gửi lời mời
7. Đối phương chấp nhận
8. Hệ thống tạo `Match`

### Flow đăng kèo

1. Chọn đội
2. Nhập thông tin trận
3. Đăng bài
4. Nhận lời mời
5. Chọn đối thủ
6. Chốt trận

## 10. Thực thể dữ liệu

### MatchPost

- id
- team_id
- date
- start_time
- end_time
- area
- venue
- field_type
- level_required
- pitch_fee_rule
- support_rule
- note
- urgency
- status

### MatchInvitation

- id
- match_post_id
- from_team_id
- to_team_id
- message
- status

### Match

- id
- home_team_id
- away_team_id
- date
- time
- venue
- field_type
- status

## 11. Trạng thái chính

### MatchPost status

- open
- pending_confirmation
- matched
- cancelled
- expired

### Invitation status

- sent
- viewed
- accepted
- declined
- expired
