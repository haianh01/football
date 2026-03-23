# 02. Cách Chạy Dự Án

## Lưu ý rất quan trọng về tên thư mục

Tên thư mục hiện tại là:

```text
/home/haianh/Templates/footballweb 
```

Thư mục này có dấu cách ở cuối tên. Vì vậy khi `cd`, nên dùng dấu nháy:

```bash
cd '/home/haianh/Templates/footballweb '
```

## Yêu cầu môi trường

- Node.js `>=16.14`
- npm `>=8`
- Docker
- Docker Compose

Bạn không bắt buộc phải cài PostgreSQL local nếu dùng Docker.

## File môi trường

Tạo `.env` từ file mẫu:

```bash
cp .env.example .env
```

Giá trị mặc định:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/footballweb?schema=public"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Chạy lần đầu

```bash
cd '/home/haianh/Templates/footballweb '
npm install
docker compose up -d postgres
npm run prisma:generate
npx prisma db push --schema apps/api/prisma/schema.prisma
```

Sau đó mở 2 terminal.

Terminal 1:

```bash
cd '/home/haianh/Templates/footballweb '
npm run dev:api
```

Terminal 2:

```bash
cd '/home/haianh/Templates/footballweb '
npm run dev:web
```

## URL local

- Web: `http://localhost:4000`
- API: `http://localhost:3001/api`
- Health check: `http://localhost:3001/api/health`

## Lệnh hay dùng

Từ root repo:

```bash
npm run dev:web
npm run dev:api
npm run prisma:generate
npm run prisma:migrate:dev
npm run build
npm run lint
```

## Nếu chỉ muốn bật frontend

```bash
cd '/home/haianh/Templates/footballweb '
npm run dev:web
```

Cách này chỉ đủ để xem giao diện tĩnh. Các flow tạo đội, tạo trận, đăng kèo vẫn cần API và DB chạy.

## Nếu bị lỗi cổng đã dùng

Web đang dùng cổng `4000`, API dùng cổng `3001`. Nếu gặp `EADDRINUSE`:

```bash
pkill -f "next dev -p 4000"
pkill -f "nest start --watch"
```

Rồi chạy lại:

```bash
docker compose up -d postgres
npm run dev:api
npm run dev:web
```

## Nếu Docker Postgres chưa chạy

Kiểm tra:

```bash
docker compose ps
```

Bật lại:

```bash
docker compose up -d postgres
```

## Cách build để kiểm tra

```bash
cd '/home/haianh/Templates/footballweb '
npm run build --workspace @footballweb/api
npm run build --workspace @footballweb/web
```

## Thứ tự khuyến nghị khi bắt đầu làm việc

1. Bật `postgres`
2. Bật `api`
3. Bật `web`
4. Mở `/test-doi-truong` để test flow tay
