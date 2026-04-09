# Team Management

## 1. Mục tiêu module

Module này là nền của toàn bộ hệ thống. Người dùng phải có thể tạo đội, mời thành viên, phân quyền và vận hành đội từ một dashboard rõ ràng.

## 2. Chức năng chính

- tạo đội mới
- chỉnh sửa hồ sơ đội
- đổi đội đang quản lý
- mời thành viên bằng link, mã đội hoặc số điện thoại
- duyệt yêu cầu tham gia
- phân quyền thành viên
- xem lịch sử trận
- xem trạng thái tham gia của từng người

## 3. Vai trò trong đội

- `captain`: toàn quyền quản lý
- `vice_captain`: hỗ trợ quản lý trận, thành viên, poll
- `treasurer`: quản lý khoản thu, thanh toán, quyết toán
- `member`: tham gia trận, vote, đóng tiền

## 4. Thực thể dữ liệu

### Team

- id
- name
- logo
- short_code
- area
- level
- play_style
- primary_color
- secondary_color
- captain_user_id
- reputation_score

### TeamMember

- id
- team_id
- user_id
- role
- joined_at
- status
- attendance_rate
- current_debt

### TeamInvite

- id
- team_id
- created_by
- invite_type
- target_user_id hoặc phone
- invite_code
- expires_at
- status

## 5. Các màn hình cần có

### 5.1 Tạo đội

Fields bắt buộc:

- tên đội
- logo
- khu vực hoạt động
- trình độ đội
- mô tả phong cách đá
- màu áo chính
- liên hệ đội trưởng

Fields nên có:

- sân thường đá
- khung giờ quen đá
- số lượng thành viên hiện có

### 5.2 Dashboard đội

Khối bắt buộc:

- thông tin đội
- việc cần xử lý hôm nay
- trận sắp tới
- vote đang mở
- khoản thu chưa đóng
- thành viên và tỷ lệ tham gia
- báo cáo nhanh

### 5.3 Danh sách thành viên

- avatar
- tên
- vai trò
- vị trí sở trường
- tỷ lệ tham gia
- công nợ hiện tại
- trạng thái hoạt động

### 5.4 Quản lý phân quyền

- đổi vai trò
- khóa / rời đội
- chuyển quyền đội trưởng

## 6. Flow chính

### Flow tạo đội

1. User đăng nhập
2. Chọn vai trò đội trưởng
3. Nhập thông tin đội
4. Hệ thống tạo `Team`
5. User được gán vai trò `captain`
6. Hệ thống gợi ý mời thành viên ngay

### Flow mời thành viên

1. Captain vào màn thành viên
2. Chọn cách mời
3. Gửi link hoặc mã đội
4. Thành viên chấp nhận
5. Captain duyệt nếu cần
6. Hệ thống ghi nhận role mặc định

## 7. Bổ sung còn thiếu từ HTML dashboard đội

Các bản HTML đã đi đúng hướng nhưng còn thiếu các phần sau:

### 7.1 Khối "Việc cần xử lý hôm nay"

Phải đặt gần đầu dashboard, gồm:

- còn bao nhiêu người chưa đóng tiền
- poll nào sắp hết hạn
- trận nào chưa đủ người
- ai chưa xác nhận tham gia trận sắp tới

### 7.2 Shortcut theo vai trò

Nếu user là captain hoặc treasurer, cần hiện quick actions:

- mời thành viên
- tạo poll
- tạo khoản thu
- nhắc đóng tiền
- phân quyền

### 7.3 Công nợ cá nhân

Dashboard đội và dashboard cá nhân đều phải có:

- tổng nợ hiện tại
- khoản gần tới hạn
- lịch sử đã đóng

### 7.4 Quyền hạn hiển thị rõ

HTML hiện chưa làm rõ ai là captain, ai là treasurer. Cần:

- badge vai trò bên cạnh tên
- action chỉ hiện nếu có quyền

### 7.5 Bottom navigation theo context

Trong context quản lý đội, nav cấp 1 nên ưu tiên:

- Home
- Match
- Team
- Finance
- Profile

`Store` không nên chiếm vị trí nổi bật hơn `Finance` ở giai đoạn đầu.

## 8. Trạng thái cần hỗ trợ

### Team status

- active
- archived
- suspended

### Member status

- active
- invited
- pending_approval
- inactive
- removed

## 9. KPI module

- số đội được tạo
- số thành viên trung bình mỗi đội
- tỷ lệ đội trưởng mời thêm thành viên trong 7 ngày đầu
- tỷ lệ thành viên xác nhận trận
- tỷ lệ đội có phát sinh poll hoặc khoản thu
