# FootballWeb

Monorepo MVP cho web quản lý đội bóng sân 7, tạo trận và đăng kèo gấp cần người.

## Stack

- `apps/web`: Next.js web app
- `apps/api`: NestJS API
- `packages/shared`: shared package
- PostgreSQL + Prisma

## Port local

- web: `http://localhost:4000`
- api: `http://localhost:3001`

## Chạy nhanh

```bash
cd '/home/haianh/Templates/footballweb '
cp .env.example .env
npm install
docker compose up -d postgres
npm run prisma:generate
npx prisma db push --schema apps/api/prisma/schema.prisma
```

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev:web
```

## Lưu ý hiện tại

- Auth mới là placeholder, chưa có session thật
- Captain-only mutations đang dùng `actorUserId` trong body
- Có sẵn playground test tay ở `/test-doi-truong`

## Tài liệu chi tiết

Xem bộ note đầy đủ tại [docs/README.md](./docs/README.md).
