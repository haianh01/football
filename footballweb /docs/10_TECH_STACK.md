# Tech Stack

## 1. Mục tiêu

Tài liệu này chốt stack kỹ thuật cho sản phẩm ở giai đoạn đầu, đồng thời giữ khả năng mở rộng về:

- nhiều module nghiệp vụ
- nhiều thị trường
- nhiều ngôn ngữ
- nhiều đội phát triển

Mục tiêu là chọn stack đủ nhanh để build MVP, nhưng không bị cụt khi sản phẩm đi xa hơn Việt Nam.

## 2. Nguyên tắc chọn stack

- ưu tiên tốc độ phát triển ở giai đoạn đầu
- type-safe từ frontend tới backend
- hỗ trợ i18n tốt
- dễ chia module theo domain
- dễ scale theo traffic và theo team
- tránh over-engineering ở MVP

## 3. Stack khuyến nghị

### Frontend

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui` hoặc design system nội bộ
- `next-intl` hoặc giải pháp i18n tương đương

### Backend

- `Next.js Route Handlers` hoặc `tRPC` ở giai đoạn đầu
- tiến tới tách `Backend API` riêng nếu domain phức tạp hơn

### Database

- `PostgreSQL`
- `Prisma ORM`

### Authentication

- `Auth.js` hoặc hệ thống auth tương đương
- hỗ trợ đăng nhập bằng:
  - số điện thoại OTP
  - Google
  - email magic link nếu cần

### Storage

- `S3-compatible object storage`
  - dùng cho avatar, logo đội, ảnh sản phẩm, file export

### Queue / Background jobs

- `Upstash QStash`, `BullMQ`, hoặc job runner tương đương
- dùng cho:
  - notification
  - reminder
  - export Excel
  - recalculation reputation

### Caching

- `Redis` nếu bắt đầu có nhiều query list/filter/realtime

### Analytics

- `PostHog` hoặc giải pháp event analytics tương đương

### Monitoring

- `Sentry`
- logging tập trung

## 4. Ngôn ngữ lập trình nên chốt

### Bắt buộc

- `TypeScript` cho toàn bộ ứng dụng web

Lý do:

- thống nhất giữa frontend và backend
- giảm mismatch type ở domain phức tạp
- dễ cho AI generate code đồng nhất hơn

### Không khuyến nghị ở giai đoạn đầu

- nhiều ngôn ngữ backend cùng lúc
- microservices bằng nhiều stack khác nhau

Ở giai đoạn đầu, một codebase TypeScript full-stack là tối ưu hơn.

## 5. Kiến trúc ứng dụng gợi ý

### Giai đoạn MVP

- `Next.js App Router`
- route theo nhóm:
  - marketing
  - platform
- business logic tổ chức theo `features/`

### Khi domain lớn hơn

Tách thành:

- `apps/web`
- `packages/ui`
- `packages/config`
- `packages/domain`
- `packages/types`

Nếu cần monorepo:

- `pnpm workspaces`
- `Turborepo`

## 6. Cấu trúc thư mục gợi ý

```text
app/
  (marketing)/
  (platform)/
components/
  shared/
  cards/
  forms/
features/
  team-management/
  matchmaking/
  player-hiring/
  reputation/
  team-finance/
  team-voting/
  notifications/
  reports/
  commerce/
lib/
  auth/
  db/
  i18n/
  payments/
  storage/
types/
```

## 7. i18n stack

Khuyến nghị:

- translation key bằng tiếng Anh
- locale đầu tiên:
  - `vi-VN`
  - `en`
- dùng `next-intl` hoặc thư viện i18n hỗ trợ App Router tốt

Các yêu cầu bắt buộc:

- locale-aware routing nếu cần SEO public
- format date/time/currency theo locale
- không hard-code text trong component

## 8. Data layer

### Database chính

- `PostgreSQL`

Lý do:

- dữ liệu quan hệ rất rõ
- cần join giữa team, match, poll, fee, payment, review
- scale tốt cho domain nghiệp vụ nhiều bảng

### ORM

- `Prisma`

Lý do:

- schema rõ
- migrate tốt
- phù hợp đội nhỏ và AI-assisted development

## 9. Authentication và authorization

### Authentication

Khuyến nghị login theo thứ tự ưu tiên:

1. số điện thoại OTP
2. Google
3. email

Lý do:

- user bóng đá phong trào dùng mobile nhiều
- OTP phù hợp hành vi mobile-first tại Việt Nam

### Authorization

Phải có 2 lớp:

- quyền cấp hệ thống
- quyền trong đội

Ví dụ:

- system roles:
  - user
  - admin
- team roles:
  - captain
  - vice_captain
  - treasurer
  - member

Không nên nhét toàn bộ logic quyền vào frontend.

## 10. API design

### Giai đoạn đầu

Có thể dùng:

- `Route Handlers` nếu muốn đơn giản
- hoặc `tRPC` nếu muốn type-safe mạnh giữa client và server

Khuyến nghị thực tế:

- nếu team nhỏ và full TypeScript: `tRPC` rất hợp
- nếu ưu tiên public API về sau: REST/Route Handlers rõ ràng hơn

### Hướng trung dung

- bắt đầu với `Route Handlers`
- chuẩn hóa service layer theo domain
- nếu cần mobile app hoặc đối tác API thì tách API boundary rõ hơn

## 11. Background jobs

Những tác vụ không nên chạy trực tiếp trong request:

- gửi notification hàng loạt
- nhắc vote và nhắc đóng tiền
- export Excel
- tính lại reputation score
- sync analytics

Khuyến nghị:

- job queue riêng
- retry policy
- audit log cho các tác vụ quan trọng

## 12. File export và báo cáo

### Excel / CSV

Nên sinh file ở background job rồi lưu vào object storage.

Lý do:

- tránh request timeout
- dễ tải lại file cũ
- dễ audit lịch sử export

## 13. Search và filter

### Giai đoạn đầu

- dùng query PostgreSQL + index đúng

### Giai đoạn sau

Nếu search nặng hơn:

- `Meilisearch`
- hoặc `Elasticsearch/OpenSearch`

Chỉ nên thêm khi thực sự cần full-text search và ranking phức tạp.

## 14. Realtime

Realtime chỉ nên dùng cho những phần có giá trị rõ:

- notification live
- cập nhật poll
- xác nhận tham gia trận

Khuyến nghị:

- bắt đầu bằng polling nhẹ + notification refresh
- nâng lên WebSocket/Pusher/Ably khi cần

## 15. Payments

Nếu sau này thu tiền online:

- tách `payment_intent`, `payment_record`, `payment_status`
- không gắn cứng logic vào một cổng thanh toán

Ở giai đoạn đầu có thể hỗ trợ:

- xác nhận thủ công
- chuyển khoản ngân hàng

Giai đoạn sau mới thêm:

- cổng thanh toán nội địa
- ví điện tử
- thanh toán quốc tế nếu mở rộng toàn cầu

## 16. Storage strategy

Lưu trên object storage cho:

- avatar người dùng
- logo đội
- ảnh sân
- ảnh sản phẩm
- file export Excel
- bằng chứng thanh toán nếu cần

Không lưu file binary trực tiếp trong database.

## 17. Logging, monitoring, audit

Phải có từ sớm:

- error monitoring
- request logging cơ bản
- audit log cho:
  - tạo poll
  - tạo khoản thu
  - xác nhận thanh toán
  - đổi quyền trong đội

Audit log rất quan trọng với module tài chính và vote.

## 18. Security basics

- validate input ở server
- rate limit cho login, invite, poll, notification
- permission check ở mọi action nhạy cảm
- signed upload cho file
- không trust client-side role

## 19. Deployment

### Giai đoạn đầu

Khuyến nghị:

- `Vercel` cho web app
- `Postgres managed`
- `Object storage managed`
- `Redis managed` nếu cần

### Giai đoạn sau

Khi cần kiểm soát sâu hơn:

- containerized deployment
- tách worker/background services

## 20. Testing strategy

### Bắt buộc

- unit test cho domain logic
- integration test cho flow quan trọng

### Ưu tiên test các luồng

- tạo đội
- đăng kèo
- chốt trận
- tạo poll
- poll sinh khoản thu
- nhắc đóng tiền
- export báo cáo

### UI

- smoke test cho các màn chính
- visual regression nếu design system bắt đầu ổn định

## 21. AI-friendly development rules

Để AI sinh code ổn định, nên chốt:

- enum bằng code tiếng Anh
- naming thống nhất giữa DB, API, UI
- mỗi domain có folder riêng
- service layer rõ
- component tái sử dụng theo inventory
- docs cập nhật cùng code

## 22. Stack recommendation kết luận

Nếu chốt một cấu hình thực dụng cho dự án này, tôi khuyên:

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui` hoặc UI kit nội bộ
- `PostgreSQL`
- `Prisma`
- `Auth.js`
- `next-intl`
- `S3-compatible storage`
- `Redis` và job queue khi bắt đầu cần reminder/export ổn định
- `Sentry`
- `PostHog`

## 23. Không nên làm sớm

- microservices
- nhiều frontend app tách rời
- nhiều ORM hoặc nhiều database chính
- search engine riêng khi chưa có nhu cầu thật
- realtime ở mọi nơi

MVP nên giữ một kiến trúc gọn, type-safe và dễ mở rộng theo domain.
