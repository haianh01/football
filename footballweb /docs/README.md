# Tài Liệu Dự Án FootballWeb

Đây là bộ note tổng hợp cho toàn bộ repo hiện tại. Tài liệu này bám theo code đang có, không mô tả những thứ chưa được implement.

## Nên đọc theo thứ tự nào

1. [01-tong-quan.md](./01-tong-quan.md)
2. [02-cach-chay.md](./02-cach-chay.md)
3. [03-kien-truc.md](./03-kien-truc.md)
4. [04-co-so-du-lieu.md](./04-co-so-du-lieu.md)
5. [05-api.md](./05-api.md)
6. [06-quyen-doi-truong.md](./06-quyen-doi-truong.md)
7. [07-ui-va-playground.md](./07-ui-va-playground.md)
8. [08-ton-dong-va-buoc-tiep-theo.md](./08-ton-dong-va-buoc-tiep-theo.md)

## Tài liệu cũ vẫn còn giá trị

- [../README.md](../README.md): entrypoint ngắn gọn ở root repo
- [../MVP_PLAN.md](../MVP_PLAN.md): plan sản phẩm ban đầu

## Tóm tắt nhanh

- Monorepo gồm `apps/web`, `apps/api`, `packages/shared`
- Frontend dùng `Next.js`, chạy ở cổng `4000`
- Backend dùng `NestJS`, chạy ở cổng `3001`
- Database dùng `PostgreSQL` qua `Docker Compose`
- ORM là `Prisma`
- Auth hiện chỉ là placeholder
- Quyền đội trưởng đang được enforce ở backend bằng `actorUserId`
- Có sẵn trang playground để test tay: `/test-doi-truong`
