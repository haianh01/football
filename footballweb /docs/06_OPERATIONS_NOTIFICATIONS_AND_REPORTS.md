# Operations Notifications And Reports

## 1. Mục tiêu module

Đây là lớp điều phối giúp sản phẩm vận hành trơn tru: lịch trận, nhắc việc, thông báo nội bộ và hệ thống báo cáo.

## 2. Phạm vi chức năng

- lịch thi đấu
- xác nhận tham gia trận
- nhắc lịch
- notification theo sự kiện
- nhắc vote
- nhắc đóng tiền
- báo cáo và export

## 3. Notification center

### Loại thông báo chính

- có người mời tham gia trận
- đối thủ chấp nhận kèo
- poll mới
- poll sắp hết hạn
- khoản thu mới
- khoản thu quá hạn
- trận sắp diễn ra
- có review mới

### Mức độ ưu tiên

- high: trận sắp đá, kèo đã chốt, khoản thu quá hạn
- medium: poll mới, nhắc xác nhận
- low: cập nhật báo cáo, recap tuần

## 4. Lịch trận

Mỗi trận cần có:

- trạng thái chốt
- danh sách người đã xác nhận
- còn thiếu bao nhiêu người
- chi phí liên quan
- link sang poll attendance nếu có

## 5. Báo cáo bắt buộc

### Báo cáo trận

- đội tham gia
- thời gian
- số người xác nhận
- số người thực tế đi
- review sau trận
- thu chi trận đó

### Báo cáo đội theo tháng

- tổng số trận
- tổng thu
- tổng chi
- công nợ còn lại
- tỷ lệ tham gia của thành viên
- tỷ lệ vote

## 6. Bổ sung còn thiếu từ HTML

### 6.1 Thiếu action center

Dashboard phải có khối ưu tiên hành động:

- 2 poll sắp hết hạn
- 3 người chưa xác nhận trận tối nay
- 4 người còn nợ tháng này

### 6.2 Thiếu nhắc tự động

HTML mới thể hiện thông tin nhưng chưa thể hiện `reminder engine`.

Cần có logic nhắc:

- trước deadline poll 24h
- trước giờ đá 6h và 2h
- trước hạn đóng tiền 48h
- sau hạn đóng tiền mỗi ngày một lần trong ngưỡng giới hạn

### 6.3 Thiếu report hub

Người dùng cần một nơi tập trung để:

- xem các báo cáo đã tạo
- chọn kỳ báo cáo
- export Excel / CSV

## 7. Thực thể dữ liệu

### Notification

- id
- user_id
- type
- title
- body
- priority
- related_entity_type
- related_entity_id
- is_read
- created_at

### ReminderJob

- id
- target_type
- target_id
- reminder_type
- scheduled_at
- status

### MatchParticipant

- id
- match_id
- user_id
- source_type
- attendance_status

## 8. Trạng thái cần hỗ trợ

### attendance_status

- invited
- confirmed
- declined
- checked_in
- absent

### reminder status

- pending
- sent
- failed
- skipped

## 9. KPI module

- tỷ lệ mở thông báo
- tỷ lệ xác nhận tham gia sau khi nhắc
- tỷ lệ đóng tiền sau reminder
- số báo cáo được export mỗi tháng
