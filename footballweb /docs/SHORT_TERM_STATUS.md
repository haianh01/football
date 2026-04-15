# Short-Term Status

Ngày cập nhật: 2026-04-15

## Đã làm trong đợt này

- Hoàn thiện `upcoming_match_shortage` trên team dashboard.
  Metric này không còn hardcode `0`; hệ thống hiện tính số cầu thủ còn thiếu để đủ quân cho các trận sắp tới dựa trên `field_type` và danh sách participant hiện có.
- Bổ sung thông tin shortage ngay trên từng card trận sắp tới ở dashboard đội.
- Mở rộng attendance flow của match để hỗ trợ thêm `checked_in` và `absent`.
- Cho captain quản lý attendance của cầu thủ cùng đội ngay trên trang match, thay vì mỗi user chỉ tự bấm `confirmed/declined`.
- Siết `listTeamsForUser` về membership `active` để UI quyền captain và danh sách đội bớt sai lệch do membership cũ.
- Bổ sung test cho route attendance, service integration của attendance, và dashboard shortage.
- Thêm `PATCH /api/v1/teams/[teamId]` để captain sửa hồ sơ đội.
- Thêm `PATCH /api/v1/teams/[teamId]/members/[memberId]` để captain đổi role, remove/reactivate member và để member tự leave team.
- Gắn UI team settings ngay trong dashboard đội.
- Gắn UI member management ngay trong dashboard đội, có guard không cho làm mất captain cuối cùng.
- Bổ sung unit test, route test và integration test cho nhánh team edit/member management.
- Thêm `PATCH /api/v1/matches/[matchId]` để captain cập nhật fixture của trận.
- Mở rộng schema `Match` với `home_score`, `away_score`, `result_note`, `completed_at`, `cancelled_at`.
- Mở rộng schema `MatchParticipant` với `goals`, `assists`, `is_mvp` để lưu stats sau trận ở mức tối thiểu.
- Cho captain cập nhật ngày đá, giờ đá, sân, khu vực, trạng thái trận ngay trên trang match.
- Cho captain chốt kết quả tối thiểu ngay trên trang match bằng tỷ số hai đội và ghi chú kết quả.
- Thêm `PATCH /api/v1/matches/[matchId]/participants/[participantId]/stats` để captain nhập goals, assists và MVP tạm cho cầu thủ cùng đội.
- Gắn form nhập stats ngay trong participant panel, không cần màn admin riêng.
- Dựng `post-match recap` tối thiểu ngay trên trang match từ scoreline + scorers + assists + MVP highlights.
- Hiển thị scoreline/result note trên match detail và trên card `scheduled_match` của match post khi trận đã complete.
- Bổ sung validation test, route test và integration test cho nhánh match lifecycle tối thiểu.
- Hoàn thiện auth session tối thiểu bằng `NextAuth` theo email, kèm Google OAuth tùy chọn khi có biến môi trường.
- Thêm login page thật, login form, logout action và session bar toàn app.
- Tự provision `user`, `user_identity`, `user_preference` khi đăng nhập lần đầu bằng email.
- Tự provision `user`, `user_identity`, `user_preference` khi đăng nhập lần đầu bằng Google; login page hiện tự bật nút Google khi có `AUTH_GOOGLE_ID` và `AUTH_GOOGLE_SECRET`.
- Đổi `getCurrentUser` sang ưu tiên session thật; dev bypass chỉ còn chạy khi có `x-demo-user-*` hoặc `DEV_AUTH_BYPASS_EMAIL`.
- Cho các page chính như `team/create`, `team/join`, `team/[teamId]`, `matches/[matchId]`, `match/posts/create` redirect về `/login` khi chưa có session.
- Bổ sung unit test cho auth actions.

## Đã có sẵn từ trước

- Tạo đội.
- Join đội bằng mã mời.
- Team dashboard cơ bản.
- Đăng kèo, xem danh sách kèo, xem chi tiết kèo.
- Gửi/chấp nhận/từ chối/hủy lời mời chốt kèo.
- Tạo match từ lời mời được chấp nhận.
- Trang match detail và danh sách participant cơ bản.

## Chưa làm trong đợt này

- Reputation/trust layer vẫn là placeholder.
  Team reputation và trust metrics ở match post hiện vẫn đang trả `0`/`null`.
- Team finance, voting, notifications, reports, commerce, player-hiring vẫn chưa có implementation thực tế.
- Team admin nâng cao vẫn chưa có.
  Đã có edit team cơ bản và member management cơ bản, nhưng chưa có flow phân quyền chi tiết hơn theo `vice_captain`, chưa có lịch sử thay đổi role, chưa có archive team.
- Auth production-grade vẫn chưa full.
  Đã có session/login dùng được theo email và Google, nhưng chưa có password, OTP/magic link, verify email, reset password và session management nâng cao.
- Match lifecycle vẫn chưa full.
  Đã có update fixture, đổi status, nhập tỷ số tối thiểu, goals, assists, MVP tạm và recap tối thiểu; nhưng chưa có event log chi tiết từng bàn, own goal, review sau trận, lịch sử chỉnh sửa và rule chi tiết hơn cho từng transition.
- Logo upload vẫn là giải pháp tạm.
  File upload hiện được đổi sang `data:` URL, chưa dùng object storage/CDN thật.

## Gợi ý bước ngắn hạn tiếp theo

1. Nâng auth từ session tối thiểu hiện tại sang auth production-grade: OTP/magic link, verify email và session/device management tốt hơn.
2. Nâng từ aggregate stats sang event-level result input: scorer, assister, own goal, phút ghi bàn.
3. Từ recap hiện tại sinh trang/share card sau trận và history cho player profile.
