# Player Hiring

## 1. Mục tiêu module

Giúp đội bóng tìm người bổ sung sát giờ và giúp cầu thủ freelance có thể tham gia trận phù hợp về vị trí, thời gian và khu vực.

## 2. Chức năng chính

- đăng tin cần người
- lọc cầu thủ
- lọc tin cần người
- xem hồ sơ cầu thủ
- ứng tuyển
- mời cầu thủ trực tiếp
- xác nhận tham gia
- review sau trận

## 3. Màn hình chính

### 3.1 Danh sách tin cần người

Phải thể hiện:

- vị trí cần
- thời gian
- sân / khu vực
- hỗ trợ phí
- mức độ gấp
- số lượng còn thiếu
- trust của đội đăng

### 3.2 Chi tiết tin cần người

- thông tin trận gốc
- yêu cầu vị trí
- số lượng
- trình độ mong muốn
- hỗ trợ
- danh sách ai đã ứng tuyển
- CTA ứng tuyển

### 3.3 Danh sách cầu thủ

- vị trí sở trường
- khu vực hoạt động
- khung giờ rảnh
- attendance rate
- review score
- số trận đã tham gia

### 3.4 Hồ sơ cầu thủ

- avatar
- chân thuận
- vị trí chính / phụ
- khu vực
- trình độ
- lịch sử tham gia
- review
- tỷ lệ đúng hẹn

## 4. Filters cần có

### Trên list tin cần người

- vị trí
- ngày / giờ
- khu vực
- hỗ trợ phí
- mức độ gấp
- sân 5 / 7 / 11
- đội uy tín

### Trên list cầu thủ

- vị trí
- khu vực
- khung giờ rảnh
- trình độ
- attendance rate
- đã đá cùng trước đó

## 5. Bổ sung còn thiếu từ HTML

HTML trước đó mới hiển thị các card đơn giản. Để dùng thật cần thêm:

- trust metrics của đội đăng tin
- hồ sơ cầu thủ có tỷ lệ đúng hẹn
- trạng thái ứng tuyển: chờ duyệt, đã mời, đã xác nhận, đã từ chối
- tag `cần gấp trong 2h`
- liên kết trực tiếp giữa tin cần người và trận đã chốt
- số lượng còn thiếu sau mỗi lần xác nhận

## 6. Flow chính

### Flow đội đi tìm người

1. Đội tạo `PlayerRequestPost`
2. Chọn vị trí, số lượng, giờ đá, khu vực
3. Đăng tin
4. Cầu thủ ứng tuyển hoặc đội mời trực tiếp
5. Đội xác nhận người phù hợp
6. Hệ thống cập nhật `MatchParticipant`

### Flow cầu thủ đi tìm kèo

1. Cầu thủ mở list tin
2. Lọc theo giờ và khu vực
3. Xem trust của đội
4. Ứng tuyển
5. Chờ duyệt
6. Xác nhận tham gia
7. Sau trận nhận review

## 7. Thực thể dữ liệu

### PlayerProfile

- id
- user_id
- preferred_positions
- secondary_positions
- strong_foot
- level
- area
- available_slots
- reputation_score
- attendance_rate

### PlayerRequestPost

- id
- team_id
- match_id
- positions_needed
- quantity
- level_required
- date
- time
- area
- support_fee
- dress_note
- urgency
- status

### PlayerApplication

- id
- player_request_post_id
- player_user_id
- message
- status

## 8. Trạng thái

### PlayerRequestPost status

- open
- partially_filled
- filled
- closed
- cancelled

### PlayerApplication status

- applied
- invited
- confirmed
- rejected
- cancelled
