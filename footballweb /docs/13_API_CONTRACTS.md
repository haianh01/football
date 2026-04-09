# API Contracts

## 1. Mục tiêu

Tài liệu này chốt hợp đồng API ở mức implementation-ready cho các module chính của hệ thống.

Mục tiêu:

- thống nhất naming giữa frontend, backend và database
- giúp AI/dev code API theo cùng một chuẩn
- giảm việc đổi shape request/response về sau
- tách rõ permission và business outcome của từng endpoint

## 2. Nguyên tắc chung

- dùng JSON cho request/response
- mọi enum trong API dùng code tiếng Anh
- không trả text hiển thị cứng theo tiếng Việt
- thời gian trả về theo ISO 8601
- tiền tệ dùng:
  - `amount_minor`
  - `currency_code`
- response list nên hỗ trợ pagination
- error format phải thống nhất

## 3. API conventions

### Base path

```text
/api/v1
```

### Pagination

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total_items": 120,
  "total_pages": 6
}
```

### Error shape

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {}
  }
}
```

### Success shape

```json
{
  "data": {}
}
```

## 4. Authentication

### Authenticated endpoints

Yêu cầu session hợp lệ hoặc token hợp lệ.

### Permission layers

- system-level permission
- team-level permission

Ví dụ:

- `captain`
- `vice_captain`
- `treasurer`
- `member`

## 5. Auth APIs

### POST `/auth/otp/request`

Gửi OTP đăng nhập.

Request:

```json
{
  "phone": "+84901234567"
}
```

Response:

```json
{
  "data": {
    "request_id": "otp_req_123",
    "expires_in_seconds": 300
  }
}
```

### POST `/auth/otp/verify`

Request:

```json
{
  "request_id": "otp_req_123",
  "otp_code": "123456"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "display_name": "Huy Nguyen",
      "preferred_locale": "vi-VN"
    },
    "session": {
      "expires_at": "2026-04-09T09:00:00Z"
    }
  }
}
```

## 6. User APIs

### GET `/users/me`

Response:

```json
{
  "data": {
    "id": "uuid",
    "display_name": "Huy Nguyen",
    "avatar_url": "https://...",
    "preferred_locale": "vi-VN",
    "timezone": "Asia/Ho_Chi_Minh",
    "spoken_languages": ["vi", "en"]
  }
}
```

### PATCH `/users/me`

Request:

```json
{
  "display_name": "Huy Nguyen",
  "preferred_locale": "en",
  "timezone": "Asia/Ho_Chi_Minh",
  "spoken_languages": ["vi", "en"]
}
```

## 7. Team APIs

### POST `/teams`

Tạo đội mới.

Permission:

- authenticated user

Request:

```json
{
  "name": "FC Warriors",
  "slug": "fc-warriors",
  "logo_url": "https://...",
  "description": "Team phong trào khu vực Hà Nội",
  "home_country_code": "VN",
  "home_city_code": "HN",
  "home_district_code": "dong-da",
  "default_locale": "vi-VN",
  "skill_level_code": "L3_INTERMEDIATE",
  "play_style_code": "balanced",
  "primary_color": "#006d37",
  "secondary_color": "#ffffff"
}
```

Response:

```json
{
  "data": {
    "team": {
      "id": "uuid",
      "name": "FC Warriors",
      "slug": "fc-warriors",
      "role_of_current_user": "captain"
    }
  }
}
```

### GET `/teams/{teamId}`

Response:

```json
{
  "data": {
    "id": "uuid",
    "name": "FC Warriors",
    "logo_url": "https://...",
    "skill_level_code": "L3_INTERMEDIATE",
    "member_count": 24,
    "reputation": {
      "score": 97.2,
      "reliability_score": 95.0,
      "punctuality_score": 91.0,
      "total_verified_matches": 42
    }
  }
}
```

### PATCH `/teams/{teamId}`

Permission:

- `captain`
- `vice_captain`

### GET `/teams/{teamId}/dashboard`

Đây là endpoint cho màn dashboard đội.

Response phải có cả `action center`, không chỉ summary:

```json
{
  "data": {
    "team_summary": {
      "id": "uuid",
      "name": "FC Warriors",
      "member_count": 24
    },
    "action_center": {
      "pending_confirmations": 3,
      "open_polls": 2,
      "overdue_fee_assignees": 4,
      "upcoming_match_shortage": 2
    },
    "upcoming_matches": [],
    "open_polls": [],
    "open_fees": [],
    "member_summary": {
      "active_members": 24,
      "average_attendance_rate": 81.5
    }
  }
}
```

### GET `/teams/{teamId}/members`

Query:

- `role`
- `status`
- `page`
- `page_size`

### POST `/teams/{teamId}/invites`

Request:

```json
{
  "invite_type": "phone",
  "target_phone": "+84901234567"
}
```

### PATCH `/teams/{teamId}/members/{memberId}`

Use cases:

- đổi role
- inactive / remove

Request:

```json
{
  "role": "treasurer",
  "status": "active"
}
```

## 8. Matchmaking APIs

### GET `/match-posts`

Danh sách tìm đối.

Query:

- `city_code`
- `district_code`
- `date_from`
- `date_to`
- `field_type`
- `team_skill_min`
- `team_skill_max`
- `pitch_fee_rule`
- `status`
- `sort`
- `page`
- `page_size`

Sort hỗ trợ:

- `nearest`
- `soonest`
- `newest`
- `highest_reputation`
- `best_match`

Response item shape:

```json
{
  "id": "uuid",
  "team": {
    "id": "uuid",
    "name": "Saigon Rangers FC",
    "logo_url": "https://...",
    "reputation": {
      "score": 97.0,
      "total_verified_matches": 42,
      "reliability_score": 95.0
    }
  },
  "date": "2026-04-10",
  "start_time": "19:30:00",
  "timezone": "Asia/Ho_Chi_Minh",
  "city_code": "HCM",
  "district_code": "quan-7",
  "venue_name": "Sân Đại Nam",
  "field_type": "7v7",
  "team_skill_min": "L3_INTERMEDIATE",
  "team_skill_max": "L4_ADVANCED",
  "pitch_fee_rule": "split_even",
  "status": "open",
  "urgency": "high"
}
```

### POST `/match-posts`

Permission:

- `captain`
- `vice_captain`

### GET `/match-posts/{matchPostId}`

Phải trả thêm:

- trust metrics
- lịch sử trận gần đây
- invitations nếu current user có quyền

### POST `/match-posts/{matchPostId}/invitations`

Gửi lời mời cho đội đăng kèo hoặc từ đội khác.

Request:

```json
{
  "from_team_id": "uuid",
  "to_team_id": "uuid",
  "message": "Bên mình trình L3-L4, có thể đá lúc 19:30."
}
```

### PATCH `/match-invitations/{invitationId}`

Request:

```json
{
  "status": "accepted"
}
```

Khi accepted:

- service có thể sinh `match`
- đóng `match_post` nếu phù hợp

## 9. Match APIs

### GET `/matches/{matchId}`

Response:

```json
{
  "data": {
    "id": "uuid",
    "status": "scheduled",
    "date": "2026-04-10",
    "start_time": "19:30:00",
    "venue_name": "Sân Đại Nam",
    "home_team": {
      "id": "uuid",
      "name": "FC Warriors"
    },
    "away_team": {
      "id": "uuid",
      "name": "Saigon Rangers FC"
    },
    "participant_summary": {
      "confirmed_count": 12,
      "pending_count": 3
    }
  }
}
```

### GET `/matches/{matchId}/participants`

### POST `/matches/{matchId}/participants`

Dùng khi thêm người từ luồng đá thuê hoặc guest.

### PATCH `/matches/{matchId}/participants/{participantId}`

Request:

```json
{
  "attendance_status": "confirmed"
}
```

## 10. Player Hiring APIs

### GET `/player-request-posts`

Query:

- `city_code`
- `district_code`
- `date`
- `position_code`
- `field_type`
- `skill_level_min`
- `skill_level_max`
- `sort`

### POST `/player-request-posts`

Permission:

- `captain`
- `vice_captain`

Request:

```json
{
  "team_id": "uuid",
  "match_id": "uuid",
  "title": "Cần 1 ST cho trận tối nay",
  "date": "2026-04-10",
  "start_time": "20:00:00",
  "timezone": "Asia/Ho_Chi_Minh",
  "city_code": "HCM",
  "district_code": "quan-7",
  "venue_name": "Sân Phú Mỹ",
  "field_type": "7v7",
  "positions_needed": ["ST"],
  "quantity": 1,
  "skill_level_min": "L3_INTERMEDIATE",
  "skill_level_max": "L4_ADVANCED",
  "support_fee_amount_minor": 50000,
  "currency_code": "VND",
  "dress_note": "Áo trắng",
  "note": "Đá fair-play, đúng giờ"
}
```

### GET `/player-request-posts/{id}`

### POST `/player-request-posts/{id}/applications`

Request:

```json
{
  "message": "Mình đá ST/RW, có thể có mặt trước 15 phút."
}
```

### PATCH `/player-applications/{applicationId}`

Permission:

- đội tạo post

Request:

```json
{
  "status": "confirmed"
}
```

Khi confirmed:

- có thể sinh / cập nhật `match_participant`

### GET `/players`

Danh sách cầu thủ discovery.

Query:

- `city_code`
- `position_code`
- `skill_level_min`
- `skill_level_max`
- `available_slot`
- `sort`

### GET `/players/{userId}`

Phải trả:

- player profile
- reputation metrics
- recent matches

## 11. Poll APIs

### GET `/teams/{teamId}/polls`

Query:

- `status`
- `type`
- `match_id`
- `page`
- `page_size`

### POST `/teams/{teamId}/polls`

Permission:

- `captain`
- `vice_captain`

Request:

```json
{
  "type": "attendance",
  "match_id": "uuid",
  "title": "Điểm danh trận gặp FC Cầu Giấy",
  "description": "Chốt người trước 18:00 ngày mai",
  "audience_type": "whole_team",
  "audience_snapshot": [],
  "result_visibility": "after_deadline",
  "allow_edit": true,
  "require_note": false,
  "deadline_at": "2026-04-10T11:00:00Z",
  "options": [
    { "label_code": "attend_yes", "label_text": "Có mặt" },
    { "label_code": "attend_no", "label_text": "Vắng mặt" }
  ],
  "financial_trigger": {
    "enabled": true,
    "fee_type": "pitch",
    "distribution_type": "fixed_per_member",
    "currency_code": "VND",
    "amount_minor": 50000,
    "apply_to_option_codes": ["attend_yes"],
    "due_at": "2026-04-10T15:00:00Z"
  }
}
```

Response:

```json
{
  "data": {
    "poll": {
      "id": "uuid",
      "status": "open"
    },
    "financial_preview": {
      "trigger_enabled": true
    }
  }
}
```

### GET `/polls/{pollId}`

Response phải có:

- thông tin poll
- options
- current vote summary
- danh sách ai chưa vote nếu caller có quyền
- linked fee nếu có

### POST `/polls/{pollId}/votes`

Request cho single choice:

```json
{
  "option_ids": ["uuid"],
  "note": "Có thể đến muộn 10 phút"
}
```

Request cho multiple choice:

```json
{
  "option_ids": ["uuid1", "uuid2"]
}
```

### POST `/polls/{pollId}/close`

Permission:

- `captain`
- `vice_captain`

Use case:

- đóng sớm
- trigger tính fee ngay nếu cần

## 12. Finance APIs

### GET `/teams/{teamId}/fees`

Query:

- `status`
- `fee_type`
- `due_from`
- `due_to`
- `page`
- `page_size`

### POST `/teams/{teamId}/fees`

Tạo khoản thu thủ công.

Permission:

- `captain`
- `treasurer`

Request:

```json
{
  "match_id": "uuid",
  "title": "Tiền sân trận thứ 7",
  "description": "Thu đều cho 12 người tham gia",
  "fee_type": "pitch",
  "distribution_type": "fixed_per_member",
  "currency_code": "VND",
  "total_amount_minor": 600000,
  "due_at": "2026-04-10T15:00:00Z",
  "assignees": [
    {
      "user_id": "uuid1",
      "amount_due_minor": 50000
    },
    {
      "user_id": "uuid2",
      "amount_due_minor": 50000
    }
  ]
}
```

### GET `/fees/{feeId}`

Phải trả:

- summary
- assignees
- payment progress
- history / reminders

### PATCH `/fees/{feeId}`

Cho phép:

- đổi due date
- hủy fee
- sửa description

Không nên cho sửa lung tung nếu đã có payment record, trừ khi có rule nghiệp vụ rõ.

### POST `/fees/{feeId}/payments`

Request:

```json
{
  "user_id": "uuid",
  "amount_minor": 50000,
  "currency_code": "VND",
  "method": "bank_transfer",
  "reference_code": "VCB123456",
  "proof_file_url": "https://..."
}
```

Response:

```json
{
  "data": {
    "payment_record": {
      "id": "uuid",
      "status": "pending_confirmation"
    }
  }
}
```

### PATCH `/payments/{paymentRecordId}`

Permission:

- `captain`
- `treasurer`

Request:

```json
{
  "status": "confirmed",
  "note": "Đã đối soát"
}
```

### GET `/teams/{teamId}/debts`

Response cho màn công nợ:

```json
{
  "data": {
    "summary": {
      "total_outstanding_amount_minor": 1200000,
      "currency_code": "VND",
      "overdue_count": 4
    },
    "members": []
  }
}
```

## 13. Reputation APIs

### GET `/teams/{teamId}/reputation`

### GET `/players/{userId}/reputation`

### POST `/matches/{matchId}/reviews`

Request:

```json
{
  "target_type": "team",
  "target_team_id": "uuid",
  "rating": 4.5,
  "punctuality_score": 5.0,
  "attitude_score": 4.5,
  "fair_play_score": 4.0,
  "level_fit_score": 4.5,
  "note": "Đúng giờ, đá fair-play."
}
```

### GET `/matches/{matchId}/reviews`

## 14. Notifications APIs

### GET `/notifications`

Query:

- `is_read`
- `priority`
- `page`
- `page_size`

### PATCH `/notifications/{notificationId}`

Request:

```json
{
  "is_read": true
}
```

### POST `/notifications/mark-all-read`

## 15. Reports APIs

### GET `/teams/{teamId}/reports/monthly-summary`

Query:

- `period_month=2026-04`

### POST `/teams/{teamId}/exports/settlement`

Permission:

- `captain`
- `treasurer`

Request:

```json
{
  "period_month": "2026-04",
  "format": "xlsx"
}
```

Response:

```json
{
  "data": {
    "export_id": "uuid",
    "status": "queued"
  }
}
```

### GET `/exports/{exportId}`

Response:

```json
{
  "data": {
    "id": "uuid",
    "status": "ready",
    "file_url": "https://..."
  }
}
```

## 16. Commerce APIs

### GET `/products`

Query:

- `category_code`
- `status`
- `page`
- `page_size`

### GET `/products/{productId}`

### POST `/orders`

Request:

```json
{
  "team_id": "uuid",
  "currency_code": "VND",
  "items": [
    {
      "product_id": "uuid",
      "product_variant_id": "uuid",
      "quantity": 2
    }
  ]
}
```

### GET `/orders/{orderId}`

## 17. API shapes cho UI đang có

### Trang tìm đối

Frontend list card hiện cần các field này từ API:

- `team.name`
- `team.logo_url`
- `team.reputation.score`
- `team.reputation.total_verified_matches`
- `date`
- `start_time`
- `city_code`
- `district_code`
- `venue_name`
- `field_type`
- `team_skill_min`
- `team_skill_max`
- `pitch_fee_rule`
- `urgency`
- `status`

### Dashboard đội

Frontend dashboard cần:

- `action_center`
- `upcoming_matches`
- `open_polls`
- `open_fees`
- `member_summary`

### Form tạo poll

Frontend form cần API preview hoặc logic tương đương cho:

- audience count
- fee trigger preview
- estimated total amount

Khuyến nghị thêm endpoint:

### POST `/teams/{teamId}/polls/preview`

Request:

```json
{
  "type": "attendance",
  "audience_type": "whole_team",
  "options": [
    { "label_code": "attend_yes", "label_text": "Có mặt" },
    { "label_code": "attend_no", "label_text": "Vắng mặt" }
  ],
  "financial_trigger": {
    "enabled": true,
    "amount_minor": 50000,
    "apply_to_option_codes": ["attend_yes"]
  }
}
```

## 18. Error codes gợi ý

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `ALREADY_VOTED`
- `POLL_CLOSED`
- `PAYMENT_ALREADY_CONFIRMED`
- `MATCH_ALREADY_CONFIRMED`
- `INSUFFICIENT_PERMISSION`

## 19. Webhook / async events gợi ý

Nếu hệ thống lớn hơn, có thể chuẩn hóa event nội bộ:

- `poll.created`
- `poll.closed`
- `fee.created`
- `payment.confirmed`
- `match.confirmed`
- `review.created`
- `export.ready`

## 20. Kết luận

File này là lớp nối giữa:

- product docs
- database schema
- implementation backend
- data needs của frontend

Khi bắt đầu code thật, nên ưu tiên dựng API cho các flow:

1. tạo đội
2. đăng kèo
3. chốt trận
4. tạo poll attendance
5. poll sinh khoản thu
6. xác nhận payment
7. export quyết toán
