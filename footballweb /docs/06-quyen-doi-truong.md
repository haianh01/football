# 06. Quyền Đội Trưởng

## Vì sao phải có file này

Đây là phần quan trọng nhất của dự án hiện tại, vì auth thật chưa có. Toàn bộ quyền captain-only đang được khóa bằng kiểm tra membership trong DB.

## Đội trưởng được tạo như thế nào

Không có entity riêng tên là "đội trưởng".

Một user trở thành đội trưởng theo 2 cách:

1. user tạo đội qua `POST /teams`, khi đó `createdBy` được thêm vào `team_members` với role `captain`
2. một captain khác thêm user vào đội với role `captain` qua `POST /teams/:id/members`

## Quyền nào đang là captain-only

- sửa thông tin đội
- thêm thành viên vào đội
- đổi role của thành viên trong đội
- tạo trận
- sửa trận
- tạo bài kèo gấp
- sửa bài kèo gấp
- accept ứng viên vào kèo
- reject ứng viên vào kèo

## Quyền nào chưa được khóa bằng auth thật

Hiện chưa có:

- session
- JWT
- guard dựa trên user đăng nhập
- decorator kiểu `@CurrentUser()`

Vì vậy phần xác thực actor đang tạm dùng:

```json
{
  "actorUserId": "..."
}
```

## Service chịu trách nhiệm check quyền

File chính:

- [../apps/api/src/common/services/team-access.service.ts](../apps/api/src/common/services/team-access.service.ts)

Các hàm chính:

- `assertCaptain(teamId, userId)`
- `assertCaptainByMatch(matchId, userId)`
- `assertCaptainByUrgentPost(postId, userId)`

## Logic check quyền

### `assertCaptain(teamId, userId)`

1. Tìm `TeamMember` theo cặp `(teamId, userId)`
2. Nếu không có membership thì trả `403 Bạn không thuộc đội này.`
3. Nếu có membership nhưng role khác `captain` thì trả `403 Chỉ đội trưởng mới được thực hiện thao tác này.`

### `assertCaptainByMatch(matchId, userId)`

1. Tìm `Match`
2. Lấy `teamId` từ match
3. Gọi lại `assertCaptain(teamId, userId)`

### `assertCaptainByUrgentPost(postId, userId)`

1. Tìm `UrgentPlayerPost`
2. Lấy `teamId` từ post
3. Gọi lại `assertCaptain(teamId, userId)`

## Những endpoint đang dùng `actorUserId`

- `PATCH /teams/:id`
- `POST /teams/:id/members`
- `PATCH /teams/:id/members/:memberId`
- `PATCH /matches/:id`
- `POST /urgent-posts`
- `PATCH /urgent-posts/:id`
- `POST /urgent-posts/:id/applications/:applicationId/accept`
- `POST /urgent-posts/:id/applications/:applicationId/reject`

Lưu ý riêng:

- `POST /matches` hiện dùng `createdBy` để kiểm tra quyền thay vì `actorUserId`

## Auto rule đáng nhớ

Khi đội trưởng `accept` đủ số người cần:

- backend đếm số application có status `accepted`
- nếu `acceptedCount >= neededPlayers`
- bài `urgent post` sẽ tự đổi sang `closed`

Ngoài ra:

- đội không được rơi vào trạng thái không còn đội trưởng nào
- nếu đổi role của đội trưởng cuối cùng sang role khác, backend sẽ chặn

## Test quyền hiện tại bằng cách nào

### Cách 1

Dùng playground `/test-doi-truong`

### Cách 2

Gọi API trực tiếp bằng `curl`, `Postman` hoặc `fetch` trong browser console

### Cách 3

Dùng phần `auto test` có sẵn trong UI playground để xem từng bước `200` hay `403`

## Hạn chế hiện tại

- user có thể giả `actorUserId` nếu chỉ nhìn API thuần
- chưa có cơ chế đăng nhập thật
- chưa có audit log
- `manager` hiện chưa có permission riêng

## Hướng nâng cấp chuẩn hơn

1. thêm auth session hoặc JWT
2. lưu user đăng nhập trong request context
3. thay `actorUserId` bằng `currentUser.id`
4. chuyển permission check thành guard hoặc policy layer
