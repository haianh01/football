# Reputation And Reviews

## 1. Mục tiêu module

Xây trust layer cho toàn hệ thống, giúp đội bóng và cầu thủ đánh giá nhau sau trận dựa trên hành vi thực tế, không chỉ theo cảm tính.

## 2. Đối tượng được review

- đội bóng
- cầu thủ freelance
- trận đấu

## 3. Nguyên tắc review

- chỉ người có tham gia hoặc được xác nhận trong trận mới được review
- review có thời hạn sau trận
- mỗi cặp người dùng chỉ review một lần cho một thực thể trong một trận
- review có thể bị khiếu nại nếu có tranh chấp

## 4. Chỉ số uy tín đội

- tổng điểm uy tín
- số trận đã xác thực
- tỷ lệ giữ kèo
- tỷ lệ đúng giờ
- fair-play score
- tỷ lệ hủy trận

## 5. Chỉ số uy tín cầu thủ

- attendance rate
- punctuality score
- attitude score
- level match fit
- số trận đã tham gia
- tỷ lệ nhận kèo rồi hủy

## 6. Badge nên dùng

Badge chỉ nên là lớp hỗ trợ:

- Gold
- Silver
- Bronze
- New

Nhưng phải luôn đi kèm số liệu thật.

## 7. Bổ sung còn thiếu từ HTML

Các bản HTML đang dùng uy tín theo kiểu `Gold/Silver/New`, nhưng như vậy chưa đủ để người dùng quyết định.

Mọi card của đội hoặc cầu thủ phải có ít nhất:

- điểm uy tín dạng phần trăm hoặc thang điểm
- số trận đã xác thực
- một chỉ số hành vi chính

Ví dụ cho đội:

- `Uy tín 97%`
- `42 trận`
- `Giữ kèo 95%`

Ví dụ cho cầu thủ:

- `Đúng hẹn 93%`
- `18 trận`
- `Vị trí ST, RW`

## 8. Màn hình cần có

### 8.1 Review sau trận

- rating tổng
- punctuality
- thái độ
- fair-play
- ghi chú

### 8.2 Hồ sơ uy tín đội

- summary metrics
- review mới nhất
- biểu đồ xu hướng
- trận đã xác thực

### 8.3 Hồ sơ uy tín cầu thủ

- attendance rate
- review breakdown
- lịch sử trận gần nhất
- vị trí thường chơi

## 9. Thực thể dữ liệu

### Review

- id
- match_id
- reviewer_id
- target_type
- target_id
- rating
- punctuality
- attitude
- fair_play
- level_fit
- note
- created_at

### ReputationSnapshot

- id
- target_type
- target_id
- total_matches
- reputation_score
- punctuality_score
- reliability_score
- cancellation_rate
- updated_at

## 10. Chống lạm dụng

- giới hạn số review bất thường
- flag review cực đoan
- cho phép admin ẩn review vi phạm
- không tính điểm cho review từ trận chưa xác thực

## 11. KPI module

- tỷ lệ trận có review
- số review hợp lệ
- số khiếu nại review
- tỷ lệ kèo bị hủy
- tỷ lệ đúng giờ trung bình
