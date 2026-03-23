# 01. Tổng Quan Dự Án

## Dự án này là gì

`FootballWeb` là MVP web cho đội bóng phong trào sân 7, đi theo hướng:

- quản lý đội
- tạo trận
- đăng bài kèo gấp khi thiếu người
- xem danh sách sân bóng như dữ liệu hỗ trợ

Hướng này được chọn để tránh phụ thuộc hoàn toàn vào network effect của một marketplace thuần "list sân + tìm đối".

## Mục tiêu MVP hiện tại

Mục tiêu của codebase hiện tại là chứng minh một đội bóng có thể dùng sản phẩm theo chu kỳ hàng tuần:

- tạo đội
- thêm thành viên
- tạo trận
- đăng kèo gấp
- nhận ứng tuyển
- đội trưởng duyệt người tham gia

## Những gì đang có trong repo

- `web` public pages bằng tiếng Việt
- `api` CRUD cơ bản cho user, team, field, match, urgent post
- `Prisma schema` cho các entity chính
- `captain-only permission` ở backend
- `playground UI` để test tay toàn bộ flow đội trưởng
- `Docker Compose` để chạy PostgreSQL local

## Những gì chưa có

- auth thật bằng session, JWT hoặc magic link
- phân quyền bằng guard/decorator ở tầng auth
- booking sân
- chat
- notification
- chia tiền
- ranking, tournament, AI matching

## Route frontend hiện có

- `/`: landing page
- `/urgent-posts`: danh sách kèo gấp
- `/fields`: danh sách sân
- `/dashboard`: dashboard demo
- `/test-doi-truong`: playground test tay và auto test

## API backend hiện có

Base URL:

```text
http://localhost:3001/api
```

Nhóm endpoint:

- `health`
- `auth`
- `users`
- `teams`
- `matches`
- `fields`
- `urgent-posts`

## Tình trạng thực tế của auth

Auth hiện tại chưa phải auth production:

- `register` dùng `upsert` theo email
- `login` chỉ tìm user theo email
- chưa tạo session
- chưa có token
- chưa có cookie

Vì vậy các mutation nhạy cảm đang dùng cách tạm:

- gửi `actorUserId` trong request body
- backend kiểm tra user đó có phải đội trưởng hay không

## Trạng thái tài liệu này

Tài liệu này phản ánh repo sau khi đã có:

- port web là `4000`
- port api là `3001`
- UI `/test-doi-truong` có cả create và edit cho team, match, urgent post
- quyền đội trưởng đã khóa ở backend
