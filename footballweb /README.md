# FootballWeb

Scaffold ban đầu cho nền tảng vận hành bóng đá phong trào.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- next-intl
- NextAuth email credentials session + optional Google OAuth
- Prisma stub

## Yêu cầu

- Node.js `>= 20.9.0`

## Chạy dự án

```bash
npm install
npm run dev
```

## Auth

- Email login luôn bật trong môi trường local hiện tại.
- Google login chỉ hiện khi đã cấu hình `AUTH_GOOGLE_ID` và `AUTH_GOOGLE_SECRET`.

## Lưu ý

- Schema dữ liệu đầy đủ đang nằm ở `docs/12_PRISMA_SCHEMA_DRAFT.prisma`.
- `prisma/schema.prisma` hiện là skeleton để bắt đầu phase scaffold.
- Flow code tiếp theo nên là `Auth -> Team Creation -> Team Dashboard`.
