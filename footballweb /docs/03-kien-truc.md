# 03. Kiến Trúc Repo

## Cấu trúc tổng thể

```text
.
├── apps
│   ├── api
│   └── web
├── packages
│   └── shared
├── docs
├── docker-compose.yml
├── package.json
├── README.md
└── MVP_PLAN.md
```

## Workspace

Root repo dùng `npm workspaces`.

Trong [../package.json](../package.json):

- `apps/*`
- `packages/*`

## Frontend: `apps/web`

Mục tiêu của frontend hiện tại:

- có landing page giải thích hướng sản phẩm
- có các page public bằng tiếng Việt
- có playground `/test-doi-truong` để thao tác tay với API

Stack:

- `Next.js 13`
- `React 18`
- App Router

Port chạy local:

- `4000`

Route hiện có:

- `/`
- `/urgent-posts`
- `/fields`
- `/dashboard`
- `/test-doi-truong`

## Backend: `apps/api`

Mục tiêu của backend hiện tại:

- expose API CRUD cơ bản cho domain MVP
- validate request bằng DTO
- enforce quyền đội trưởng ở service layer

Stack:

- `NestJS 10`
- `Prisma`
- `PostgreSQL`

Port chạy local:

- `3001`

Thiết lập chung trong `main.ts`:

- prefix toàn cục là `/api`
- bật `CORS`
- bật `ValidationPipe`
- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

## Module backend hiện có

- `AuthModule`
- `UsersModule`
- `FieldsModule`
- `TeamsModule`
- `MatchesModule`
- `UrgentPostsModule`
- `PrismaModule`
- `TeamAccessModule`

## Luồng dữ liệu chính

### Luồng tạo đội

1. User được tạo qua `POST /auth/register`
2. Tạo đội qua `POST /teams`
3. `createdBy` của team sẽ tự được thêm vào `team_members` với role `captain`

### Luồng tạo trận

1. Chọn một đội
2. Gửi `POST /matches`
3. Backend kiểm tra `createdBy` có là captain của đội đó không

### Luồng đăng kèo gấp

1. Chọn một trận đã tạo
2. Gửi `POST /urgent-posts`
3. Backend kiểm tra người thao tác có là captain của đội sở hữu trận đó không
4. Kèo gấp được gắn với `matchId` và `teamId`

### Luồng ứng tuyển và duyệt

1. User thường gọi `POST /urgent-posts/:id/apply`
2. Đội trưởng gọi `accept` hoặc `reject`
3. Nếu số người accepted đủ `neededPlayers`, post tự chuyển sang `closed`

## Gói `packages/shared`

Hiện tại `packages/shared` mới là khung workspace, chưa đóng vai trò lớn trong runtime của dự án.

## Kiến trúc hiện tại mạnh ở đâu

- nhanh để ship MVP
- domain model khá rõ
- dễ test tay qua playground
- chưa bị over-engineer

## Kiến trúc hiện tại còn yếu ở đâu

- chưa có auth thật
- chưa có test tự động
- permission đang nằm ở service, chưa lên guard/auth layer
- frontend phần lớn vẫn là demo và playground, chưa thành product flow hoàn chỉnh
