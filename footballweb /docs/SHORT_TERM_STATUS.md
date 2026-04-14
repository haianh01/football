# Short-Term Status

Ngày cập nhật: 2026-04-14

## Đã làm trong đợt này

- Hoàn thiện `upcoming_match_shortage` trên team dashboard.
  Metric này không còn hardcode `0`; hệ thống hiện tính số cầu thủ còn thiếu để đủ quân cho các trận sắp tới dựa trên `field_type` và danh sách participant hiện có.
- Bổ sung thông tin shortage ngay trên từng card trận sắp tới ở dashboard đội.
- Mở rộng attendance flow của match để hỗ trợ thêm `checked_in` và `absent`.
- Cho captain quản lý attendance của cầu thủ cùng đội ngay trên trang match, thay vì mỗi user chỉ tự bấm `confirmed/declined`.
- Siết `listTeamsForUser` về membership `active` để UI quyền captain và danh sách đội bớt sai lệch do membership cũ.
- Bổ sung test cho route attendance, service integration của attendance, và dashboard shortage.

## Đã có sẵn từ trước

- Tạo đội.
- Join đội bằng mã mời.
- Team dashboard cơ bản.
- Đăng kèo, xem danh sách kèo, xem chi tiết kèo.
- Gửi/chấp nhận/từ chối/hủy lời mời chốt kèo.
- Tạo match từ lời mời được chấp nhận.
- Trang match detail và danh sách participant cơ bản.

## Chưa làm trong đợt này

- Auth thật vẫn chưa hoàn thiện.
  `NextAuth` vẫn chưa cấu hình provider thật và trang `/login` vẫn là placeholder.
- Reputation/trust layer vẫn là placeholder.
  Team reputation và trust metrics ở match post hiện vẫn đang trả `0`/`null`.
- Team finance, voting, notifications, reports, commerce, player-hiring vẫn chưa có implementation thực tế.
- Team admin nâng cao vẫn chưa có.
  Chưa có flow edit team profile, đổi vai trò thành viên, kick member, leave team.
- Match lifecycle vẫn chưa full.
  Chưa có reschedule, cancel match, nhập kết quả, review sau trận.
- Logo upload vẫn là giải pháp tạm.
  File upload hiện được đổi sang `data:` URL, chưa dùng object storage/CDN thật.

## Gợi ý bước ngắn hạn tiếp theo

1. Thêm `PATCH /api/v1/teams/[teamId]` + form chỉnh sửa hồ sơ đội cho captain.
2. Thêm member management: đổi role, remove member, leave team.
3. Thêm match lifecycle tối thiểu: captain cancel match, cập nhật venue/time, chốt kết quả sau trận.
