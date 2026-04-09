# Tổng Quan Sản Phẩm

## 1. Định nghĩa sản phẩm

Đây là một nền tảng vận hành bóng đá phong trào tại Việt Nam, phục vụ đồng thời đội bóng, cầu thủ freelance và ban quản lý đội.

Sản phẩm không chỉ giải quyết bài toán `tìm đối` mà còn bao phủ các nhu cầu:

- tạo và quản lý đội bóng
- tìm đối thủ
- tìm người đá thuê
- xây dựng uy tín đội và cầu thủ
- vote nội bộ
- thu tiền và theo dõi công nợ
- xuất báo cáo quyết toán
- bán sản phẩm và dịch vụ liên quan

## 2. Tầm nhìn

Trở thành nơi một đội bóng phong trào có thể vận hành gần như toàn bộ hoạt động hằng tuần trong một hệ thống duy nhất, thay vì phải tách sang Facebook, Zalo, Google Sheets và chuyển khoản thủ công.

## 3. Bài toán cần giải quyết

Hiện trạng chung của bóng đá phong trào:

- tin tìm đối rời rạc, khó lọc, khó kiểm chứng
- thiếu người sát giờ nhưng không có nguồn cầu thủ đáng tin
- không có hồ sơ đội và cầu thủ chuẩn hóa
- việc vote nội bộ nằm trong chat, rất khó theo dõi
- thu tiền sân, quỹ, giải đấu và áo đội thường làm thủ công
- quyết toán cuối tháng thiếu minh bạch và mất thời gian

## 4. Nhóm người dùng chính

### Đội trưởng / quản lý đội

- tạo đội
- quản lý thành viên và phân quyền
- đăng kèo tìm đối
- đăng tin cần người
- tạo poll
- tạo khoản thu
- xem báo cáo đội

### Thành viên đội

- xác nhận tham gia trận
- vote nội bộ
- xem công nợ
- thanh toán
- theo dõi lịch đội

### Cầu thủ freelance

- tạo hồ sơ cá nhân
- tìm kèo cần người
- ứng tuyển
- tích lũy uy tín

### Admin

- kiểm duyệt nội dung
- xử lý báo cáo
- quản lý đội, người dùng, poll, fee, order

## 5. Trụ cột sản phẩm

Sản phẩm được chia thành 7 domain chính:

1. `Team Creation & Management`
2. `Matchmaking`
3. `Player Hiring`
4. `Trust & Reputation`
5. `Team Finance & Voting`
6. `Operations, Notifications & Reports`
7. `Commerce`

## 6. Nguyên tắc thiết kế sản phẩm

- mobile-first tuyệt đối
- mọi màn hình phải có hành động chính rõ ràng
- ưu tiên quyết định nhanh trong 3 giây
- thông tin phải chuẩn hóa theo domain, không viết tự do quá nhiều
- trust phải hiển thị bằng chỉ số thật, không chỉ bằng badge
- dashboard phải ưu tiên `việc cần xử lý`, không chỉ là thống kê đẹp

## 7. Kiến trúc thông tin mức cao

### Public

- Trang chủ
- Tìm đối
- Tìm người đá thuê
- Danh sách đội bóng
- Danh sách cầu thủ
- Cửa hàng

### Team Platform

- Tạo đội
- Dashboard đội
- Thành viên
- Lịch thi đấu
- Polls
- Khoản thu
- Công nợ
- Báo cáo / export

### Match Platform

- Danh sách kèo tìm đối
- Chi tiết kèo
- Đăng kèo
- Tin cần người
- Hồ sơ cầu thủ
- Chi tiết trận

### User

- Hồ sơ cá nhân
- Thông báo
- Lịch sử hoạt động

### Admin

- Dashboard quản trị
- Quản lý nội dung
- Quản lý báo cáo

## 8. Các thực thể dữ liệu lõi

- `User`
- `Team`
- `TeamMember`
- `TeamInvite`
- `PlayerProfile`
- `MatchPost`
- `PlayerRequestPost`
- `Match`
- `MatchParticipant`
- `Review`
- `Poll`
- `PollOption`
- `PollVote`
- `TeamFee`
- `TeamFeeAssignee`
- `PaymentRecord`
- `Notification`
- `SettlementExport`
- `Product`
- `Order`

## 9. Roadmap gợi ý

### Giai đoạn 1: MVP

- tạo đội
- quản lý thành viên cơ bản
- tìm đối
- tìm người đá thuê
- hồ sơ đội
- hồ sơ cầu thủ
- review sau trận

### Giai đoạn 2: Retention

- dashboard đội hoàn chỉnh
- vote nội bộ
- thu tiền
- nhắc đóng tiền
- công nợ cá nhân
- lịch sử trận
- bảng uy tín

### Giai đoạn 3: Scale & Monetization

- export Excel nâng cao
- báo cáo quyết toán theo tháng và theo trận
- cửa hàng hoàn chỉnh
- dịch vụ in áo, booking sân, gói premium

## 10. Bản đồ tài liệu

Các file chi tiết đi kèm tài liệu này:

- `01_TEAM_MANAGEMENT.md`
- `02_MATCHMAKING.md`
- `03_PLAYER_HIRING.md`
- `04_TEAM_FINANCE_AND_VOTING.md`
- `05_REPUTATION_AND_REVIEWS.md`
- `06_OPERATIONS_NOTIFICATIONS_AND_REPORTS.md`
- `07_FRONTEND_ARCHITECTURE_AND_COMPONENTS.md`
- `08_COMMERCE.md`
- `09_GLOBALIZATION_LANGUAGE_AND_SKILL_SYSTEM.md`
- `10_TECH_STACK.md`
- `11_DATABASE_SCHEMA.md`
- `12_PRISMA_SCHEMA_DRAFT.prisma`
- `13_API_CONTRACTS.md`

Mỗi file chi tiết đều bổ sung các phần còn thiếu đã lộ ra từ các bản HTML phác thảo trước đó.
