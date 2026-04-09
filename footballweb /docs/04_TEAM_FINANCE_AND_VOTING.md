# Team Finance And Voting

## 1. Mục tiêu module

Đây là module giữ chân dài hạn nhất của sản phẩm. Nó giúp đội bóng biểu quyết, điểm danh, thu tiền, theo dõi công nợ và xuất báo cáo quyết toán minh bạch.

## 2. Phạm vi chức năng

- tạo poll
- vote nội bộ
- điểm danh tham gia trận
- tạo khoản thu thủ công
- tạo khoản thu từ poll
- nhắc đóng tiền
- xác nhận thanh toán
- theo dõi công nợ cá nhân
- export Excel

## 3. Các loại poll bắt buộc

- `attendance`: điểm danh tham gia trận
- `approval`: đồng ý / không đồng ý
- `single_choice`: chọn 1 phương án
- `multiple_choice`: chọn nhiều phương án

## 4. Đối tượng nhận poll

Mỗi poll phải chọn rõ audience:

- toàn đội
- đội hình của một trận cụ thể
- ban cán sự
- danh sách chọn tay

## 5. Rule cấu hình poll

- deadline
- có hiển thị kết quả trước khi chốt hay không
- có cho sửa phiếu hay không
- mỗi người được chọn mấy lựa chọn
- có bắt buộc ghi chú hay không

## 6. Cấu hình tài chính gắn với poll

Một poll có thể sinh khoản thu nếu bật `financial trigger`.

### Các rule bắt buộc

- loại khoản thu: sân, giải, quỹ, áo, khác
- số tiền cố định hoặc chia đều
- áp dụng cho ai:
  - người chọn option A
  - tất cả người trả lời
  - danh sách chọn tay
- hạn thanh toán
- có gửi nhắc thanh toán tự động hay không

## 7. Màn hình cần có

### 7.1 Danh sách poll

- poll đang mở
- poll sắp hết hạn
- poll đã kết thúc
- tỷ lệ tham gia

### 7.2 Form tạo poll

Khối bắt buộc:

- loại poll
- tiêu đề
- mô tả
- các lựa chọn
- audience
- deadline
- rule hiển thị kết quả
- khối tài chính
- preview hệ quả

### 7.3 Chi tiết poll

- thống kê phiếu
- ai đã vote / chưa vote
- trạng thái chốt
- nếu bật tài chính thì xem liên kết sang khoản thu

### 7.4 Danh sách khoản thu

- khoản thu đang mở
- khoản thu quá hạn
- khoản thu đã hoàn tất

### 7.5 Chi tiết khoản thu

- tổng tiền
- số người phải đóng
- đã đóng / chưa đóng / miễn thu
- lịch sử nhắc
- thanh toán từng người

### 7.6 Công nợ thành viên

- tổng nợ hiện tại
- khoản nào quá hạn
- đã đóng bao nhiêu trong tháng

### 7.7 Báo cáo và export

- báo cáo tháng
- báo cáo theo trận
- báo cáo theo loại khoản thu
- export Excel

## 8. Bổ sung còn thiếu từ HTML tạo poll và dashboard tài chính

### 8.1 Thiếu loại poll

Form HTML mới đang giả định mọi poll giống nhau. Phải thêm selector `attendance`, `approval`, `single_choice`, `multiple_choice`.

### 8.2 Thiếu audience

Phải cho chọn poll gửi cho ai. Nếu không, module không dùng được trong thực tế.

### 8.3 Thiếu rule hiển thị kết quả

Cần rõ:

- công khai kết quả ngay
- chỉ hiện sau deadline
- chỉ captain xem

### 8.4 Thiếu preview nghiệp vụ

Khi bật tài chính, form phải preview:

- bao nhiêu người bị áp dụng
- tổng tiền dự kiến
- khoản thu sẽ sinh ra như thế nào

### 8.5 Thiếu template poll

Khối trang trí trong HTML nên đổi thành template dùng thật:

- điểm danh trận
- vote mẫu áo
- vote tham gia giải
- vote thu quỹ tháng

### 8.6 Thiếu action tài chính trên dashboard

Dashboard tài chính phải có:

- nhắc đóng tiền
- xem công nợ
- tạo khoản thu
- export tháng này

### 8.7 Thiếu trạng thái công nợ đủ sâu

Mỗi assignee cần trạng thái:

- pending
- paid
- overdue
- waived
- partially_paid

## 9. Flow chính

### Flow tạo poll attendance gắn tiền sân

1. Captain tạo poll attendance
2. Chọn trận liên quan
3. Option mặc định: có mặt / vắng mặt
4. Bật financial trigger
5. Chọn áp dụng cho người chọn `có mặt`
6. Nhập số tiền hoặc chia đều
7. Khi poll chốt, hệ thống sinh `TeamFee`

### Flow tạo khoản thu thủ công

1. Treasurer tạo khoản thu
2. Chọn loại khoản thu
3. Chọn đối tượng
4. Chọn cách chia tiền
5. Đặt due date
6. Hệ thống gửi notification

### Flow đối soát và export

1. Treasurer xác nhận người đã đóng
2. Hệ thống cập nhật công nợ
3. Chọn tháng cần export
4. Sinh file Excel

## 10. Thực thể dữ liệu

### Poll

- id
- team_id
- type
- title
- description
- audience_type
- audience_snapshot
- deadline
- result_visibility
- allow_edit
- status
- created_by

### PollOption

- id
- poll_id
- label
- sort_order

### PollVote

- id
- poll_id
- user_id
- option_id
- note
- voted_at

### TeamFee

- id
- team_id
- title
- fee_type
- total_amount
- distribution_type
- due_date
- source_poll_id
- created_by
- status

### TeamFeeAssignee

- id
- team_fee_id
- user_id
- amount_due
- amount_paid
- payment_status
- paid_at

### PaymentRecord

- id
- team_fee_id
- user_id
- amount
- method
- confirmed_by
- paid_at
- note

### SettlementExport

- id
- team_id
- period_month
- format
- file_url
- created_by
- created_at

## 11. Cột dữ liệu export Excel

### Báo cáo công nợ thành viên

- thành viên
- vai trò
- khoản thu
- loại khoản thu
- số phải đóng
- số đã đóng
- trạng thái
- hạn đóng
- ngày thanh toán
- ghi chú

### Báo cáo tháng

- ngày
- nội dung
- loại giao dịch
- thu / chi
- người liên quan
- trạng thái
- số dư sau giao dịch

## 12. KPI module

- số poll tạo mỗi tuần
- tỷ lệ thành viên vote
- tỷ lệ khoản thu được thanh toán đúng hạn
- tỷ lệ captain dùng export
- tỷ lệ đội có phát sinh công nợ hàng tháng
