# 08. Tồn Đọng Và Bước Tiếp Theo

## Những gì đã ổn cho MVP kỹ thuật

- monorepo chạy được local
- PostgreSQL chạy qua Docker
- Prisma schema rõ ràng
- CRUD cơ bản cho các domain chính đã có
- quyền đội trưởng đã khóa ở backend
- có UI playground đủ để test tay nhiều flow

## Những gì đang còn thiếu rõ rệt

### Auth thật

Đây là lỗ hổng lớn nhất hiện tại.

Thiếu:

- session
- JWT hoặc cookie
- current user trong request
- bảo vệ endpoint theo user đăng nhập

Hậu quả:

- các mutation nhạy cảm vẫn phải gửi `actorUserId`

### Frontend production flow

Hiện frontend chia làm 2 kiểu:

- page public mô phỏng
- playground test tay

Thiếu:

- form production cho user cuối
- fetch data theo session thật
- UX hoàn chỉnh cho captain và player

### Seed data

Hiện chưa có:

- migration chuẩn có seed
- seed sân bóng mẫu
- dữ liệu demo ổn định cho local/dev

### Test tự động

Thiếu:

- unit test
- integration test
- e2e test

## Thứ tự ưu tiên kỹ thuật mình khuyến nghị

### Ưu tiên 1

Làm auth thật để bỏ `actorUserId` khỏi body.

### Ưu tiên 2

Tách UI production khỏi playground:

- trang tạo đội
- trang tạo trận
- trang đăng kèo
- trang duyệt ứng viên

### Ưu tiên 3

Thêm migration và seed script để môi trường local ổn định hơn.

### Ưu tiên 4

Viết test integration cho các flow:

- create team
- add member
- create match
- create urgent post
- apply
- accept đủ người và auto close post

## Rủi ro hiện tại

- API chưa có auth thật nên chưa an toàn
- endpoint `POST /fields` chưa có admin auth
- playground page khá lớn, sau này nên tách component
- tên thư mục repo có dấu cách cuối dễ gây khó chịu khi thao tác shell

## Refactor nên làm sau

- tách `/test-doi-truong` thành nhiều component nhỏ
- tạo service client dùng chung cho frontend
- thêm kiểu dữ liệu shared vào `packages/shared`
- thêm layer policy hoặc guard cho backend

## Hướng sản phẩm nên giữ

Nếu tiếp tục theo tinh thần MVP hiện tại thì nên đi theo:

- tool cho đội bóng
- lịch trận
- kèo gấp cần người
- field directory như dữ liệu hỗ trợ

Không nên mở rộng quá sớm sang:

- social feed
- app native
- AI matching
- video highlight
- booking/payment phức tạp

## Tài liệu liên quan

- [../MVP_PLAN.md](../MVP_PLAN.md)
- [05-api.md](./05-api.md)
- [06-quyen-doi-truong.md](./06-quyen-doi-truong.md)
- [07-ui-va-playground.md](./07-ui-va-playground.md)
