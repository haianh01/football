# 05. API Hiện Tại

## Base URL

```text
http://localhost:3001/api
```

## Quy ước chung

- API dùng `ValidationPipe` toàn cục
- field lạ trong body sẽ bị reject
- DTO có `transform: true`, nên một số số nguyên được cast từ string
- auth thật chưa có
- mutation captain-only đang dùng `actorUserId` tạm thời

## Health

### `GET /health`

Dùng để kiểm tra API sống.

Response mẫu:

```json
{
  "status": "ok",
  "service": "footballweb-api"
}
```

## Auth

### `POST /auth/register`

Body:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com"
}
```

Ghi chú:

- hiện dùng `upsert` theo email
- nếu email đã tồn tại thì cập nhật `name`

### `POST /auth/login`

Body:

```json
{
  "email": "a@example.com"
}
```

Ghi chú:

- chưa tạo session
- chỉ tìm user theo email và trả message placeholder

## Users

### `GET /users/:id`

Trả user và danh sách team user đang thuộc về.

### `PATCH /users/:id`

Body có thể gồm:

```json
{
  "name": "Nguyen Van A",
  "phone": "0900000000",
  "avatarUrl": "https://example.com/a.png",
  "homeDistrict": "Cau Giay",
  "skillLevel": "intermediate",
  "preferredPositions": ["GK", "CB"]
}
```

## Teams

### `POST /teams`

Body:

```json
{
  "name": "FC Cau Giay",
  "slug": "fc-cau-giay",
  "city": "Ha Noi",
  "district": "Cau Giay",
  "description": "Da vui la chinh",
  "skillLevel": "intermediate",
  "createdBy": "user_id"
}
```

Ghi chú:

- `createdBy` sẽ tự thành `captain` trong team mới

### `GET /teams/:id`

Trả:

- thông tin đội
- creator
- members kèm user
- 10 trận gần nhất

### `PATCH /teams/:id`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "name": "FC Cau Giay Moi",
  "city": "Ha Noi",
  "district": "Cau Giay",
  "description": "Da toi thu 4 va thu 6",
  "skillLevel": "advanced"
}
```

### `GET /teams/:id/matches`

Trả tất cả trận của đội, kèm `field` và `urgentPosts`.

### `POST /teams/:id/members`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "userId": "member_user_id",
  "role": "member"
}
```

`role` có thể là:

- `captain`
- `manager`
- `member`

### `PATCH /teams/:id/members/:memberId`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "role": "captain"
}
```

Use case hiện tại:

- bổ nhiệm một thành viên có sẵn thành đội trưởng
- đổi role của thành viên trong đội

Rule:

- không được hạ cấp đội trưởng cuối cùng của đội

## Fields

### `GET /fields`

Query tùy chọn:

```text
?district=Cau%20Giay
```

### `GET /fields/:id`

Trả thông tin sân và 5 trận gần nhất gắn với sân đó.

### `POST /fields`

Body:

```json
{
  "name": "San Bong 247",
  "address": "123 Tran Duy Hung",
  "city": "Ha Noi",
  "district": "Cau Giay",
  "googleMapsUrl": "https://maps.google.com/...",
  "pitchType": "SEVEN",
  "priceRange": "600k-800k",
  "contactPhone": "0900000000",
  "verified": true
}
```

Ghi chú:

- hiện chưa có auth admin thật, endpoint này đang mở

## Matches

### `POST /matches`

Captain-only.

Body:

```json
{
  "teamId": "team_id",
  "fieldId": "field_id",
  "title": "Tran giao huu toi thu 5",
  "startsAt": "2026-03-21T20:00:00.000Z",
  "endsAt": "2026-03-21T21:30:00.000Z",
  "district": "Cau Giay",
  "status": "open",
  "notes": "Can them 2 nguoi da bien",
  "createdBy": "captain_user_id"
}
```

Lưu ý:

- ở endpoint tạo trận, field xác thực quyền là `createdBy`
- user này phải là captain của team

### `GET /matches/:id`

Trả:

- match
- team
- field
- urgentPosts
- applications của từng urgent post

### `PATCH /matches/:id`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "title": "Tran da doi gio",
  "startsAt": "2026-03-21T20:30:00.000Z",
  "endsAt": "2026-03-21T22:00:00.000Z",
  "district": "Nam Tu Liem",
  "status": "open",
  "notes": "Mang ao 2 mau"
}
```

## Urgent Posts

### `GET /urgent-posts`

Query:

- `page`
- `pageSize`
- `district`
- `skillLevel`
- `status`

Ví dụ:

```text
/urgent-posts?page=1&pageSize=20&district=Cau%20Giay&status=open
```

### `GET /urgent-posts/:id`

Trả:

- post
- team
- match và field
- applications kèm user

### `POST /urgent-posts`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "matchId": "match_id",
  "teamId": "team_id",
  "neededPlayers": 2,
  "skillLevel": "intermediate",
  "feeShare": "150k/ng",
  "description": "Can 2 ban da canh",
  "expiresAt": "2026-03-21T19:30:00.000Z",
  "status": "open"
}
```

Rule:

- `matchId` phải thuộc cùng `teamId`

### `PATCH /urgent-posts/:id`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id",
  "neededPlayers": 1,
  "skillLevel": "advanced",
  "feeShare": "200k/ng",
  "description": "Can mot ban da trung ve",
  "expiresAt": "2026-03-21T20:00:00.000Z",
  "status": "open"
}
```

### `POST /urgent-posts/:id/apply`

Body:

```json
{
  "userId": "user_id",
  "message": "Em da duoc san 7 va toi dung gio"
}
```

### `POST /urgent-posts/:id/applications/:applicationId/accept`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id"
}
```

### `POST /urgent-posts/:id/applications/:applicationId/reject`

Captain-only.

Body:

```json
{
  "actorUserId": "captain_user_id"
}
```

## Lỗi nghiệp vụ dễ gặp

### Không phải đội trưởng

Response:

```json
{
  "statusCode": 403,
  "message": "Chỉ đội trưởng mới được thực hiện thao tác này.",
  "error": "Forbidden"
}
```

### Không thuộc đội

Response:

```json
{
  "statusCode": 403,
  "message": "Bạn không thuộc đội này.",
  "error": "Forbidden"
}
```

### Match không thuộc team của urgent post

Response:

```json
{
  "statusCode": 400,
  "message": "Bài kèo gấp phải thuộc đúng đội của trận đấu.",
  "error": "Bad Request"
}
```
