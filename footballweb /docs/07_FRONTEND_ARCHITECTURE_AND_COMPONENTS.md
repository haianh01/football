# Frontend Architecture And Components

## 1. Mục tiêu

Tài liệu này chốt khung frontend để AI và dev có thể code theo cùng một chuẩn, tránh việc mỗi màn hình một kiểu.

## 2. Cấu trúc route gợi ý

```text
app/
  (marketing)/
    page.tsx
    match/
    players/
    store/
  (platform)/
    team/
    match/
    hiring/
    polls/
    finance/
    reports/
    profile/
```

## 3. Cấu trúc feature gợi ý

```text
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
components/
  shared/
  layout/
  cards/
  forms/
```

## 4. Component inventory bắt buộc

- `TeamCard`
- `MatchCard`
- `PlayerCard`
- `TrustBadge`
- `TrustMetrics`
- `PollCard`
- `FeeCard`
- `DebtSummary`
- `AttendanceStrip`
- `NotificationItem`
- `FilterChipBar`
- `SortBar`
- `StickyActionBar`
- `EmptyState`
- `LoadingSkeleton`

## 5. Layout rules theo context

### Trang list

- top app bar
- search
- filter chips
- sort
- content list
- FAB nếu có action tạo mới

### Dashboard đội

Thứ tự ưu tiên:

1. team identity
2. action center
3. trận sắp tới
4. vote / khoản thu cần xử lý
5. thành viên
6. báo cáo

### Form tạo mới

Thứ tự:

1. loại đối tượng
2. thông tin cơ bản
3. rule nghiệp vụ
4. preview hệ quả
5. CTA submit

## 6. Quy tắc CTA

- chỉ một CTA nổi bật chính trên mỗi màn
- text CTA phải mô tả hành động thật
- không dùng dấu `+` mơ hồ nếu action có domain rõ

Ví dụ:

- đúng: `Đăng kèo`
- đúng: `Tạo khoản thu`
- đúng: `Tạo poll`
- chưa tốt: `Nhận kèo ngay` ở list card

## 7. Quy tắc hiển thị trust

- badge chỉ là lớp nhận diện phụ
- mọi card quan trọng phải có số liệu thật
- trust metrics phải nhất quán giữa list và detail

## 8. Quy tắc navigation

### Giai đoạn đầu nên ưu tiên

- Home
- Match
- Team
- Finance
- Profile

`Store` nên là điểm đến từ Home hoặc tab phụ cho tới khi commerce đủ mạnh.

## 9. Quy tắc state

Mọi màn đều phải có:

- empty state
- loading state
- error state
- success feedback
- permission state

## 10. Khoảng trống cần sửa từ các HTML đã có

### Trên dashboard đội

- thêm action center
- thêm công nợ cá nhân
- làm rõ role và quyền

### Trên trang tìm đối

- thêm sort
- thêm trust metrics
- đổi CTA theo bước
- đổi FAB thành `Đăng kèo`

### Trên form tạo poll

- thêm loại poll
- thêm audience
- thêm preview tài chính
- thay phần decorative bằng templates dùng thật
