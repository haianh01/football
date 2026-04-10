# Database Schema

## 1. Mục tiêu

Tài liệu này chốt schema dữ liệu lõi cho hệ thống ở mức logical schema, đủ để:

- thiết kế Prisma schema hoặc SQL schema
- thống nhất naming giữa backend và frontend
- tránh việc mỗi module tự tạo bảng theo cảm tính
- hỗ trợ mở rộng đa ngôn ngữ và đa thị trường

Tài liệu này chưa phải migration file, nhưng phải đủ rõ để chuyển thành migration.

## 2. Nguyên tắc thiết kế schema

- dùng `PostgreSQL` làm database chính
- naming bằng tiếng Anh, `snake_case` ở database
- mọi enum nghiệp vụ dùng code ổn định
- không lưu text hiển thị làm giá trị domain gốc
- luôn có `created_at`, `updated_at` cho bảng chính
- thêm soft-delete chỉ khi thực sự cần
- các bảng nghiệp vụ quan trọng phải có audit trail hoặc ít nhất là metadata người tạo

## 3. Module và nhóm bảng

### Identity

- `users`
- `user_identities`
- `user_preferences`

### Team

- `teams`
- `team_members`
- `team_invites`

### Matchmaking

- `match_posts`
- `match_invitations`
- `matches`
- `match_participants`

### Player Hiring

- `player_profiles`
- `player_request_posts`
- `player_applications`

### Reputation

- `reviews`
- `reputation_snapshots`

### Voting & Finance

- `polls`
- `poll_options`
- `poll_votes`
- `team_fees`
- `team_fee_assignees`
- `payment_records`

### Operations

- `notifications`
- `reminder_jobs`
- `audit_logs`
- `settlement_exports`

### Commerce

- `products`
- `product_variants`
- `orders`
- `order_items`

### Planned Media

- `media_assets`
- `team_media`
- `player_media`
- `media_moderation_logs`
- `media_processing_jobs`

## 4. Bảng identity

### users

Thông tin user gốc của hệ thống.

Columns:

- `id` uuid pk
- `phone` varchar null unique
- `email` varchar null unique
- `display_name` varchar not null
- `avatar_url` text null
- `country_code` varchar(2) not null default `'VN'`
- `timezone` varchar not null default `'Asia/Ho_Chi_Minh'`
- `preferred_locale` varchar not null default `'vi-VN'`
- `status` user_status not null default `'active'`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### user_identities

Liên kết user với provider đăng nhập.

Columns:

- `id` uuid pk
- `user_id` uuid fk -> users.id
- `provider` identity_provider not null
- `provider_subject` varchar not null
- `created_at` timestamptz not null

Unique:

- `(provider, provider_subject)`

### user_preferences

Columns:

- `user_id` uuid pk fk -> users.id
- `spoken_languages` jsonb not null default `'[]'`
- `notification_settings` jsonb not null default `'{}'`
- `marketing_opt_in` boolean not null default false
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

## 5. Bảng team

### teams

Columns:

- `id` uuid pk
- `name` varchar not null
- `slug` varchar not null unique
- `short_code` varchar not null unique
- `logo_url` text null
- `description` text null
- `home_country_code` varchar(2) not null default `'VN'`
- `home_state_code` varchar null
- `home_city_code` varchar null
- `home_district_code` varchar null
- `default_locale` varchar not null default `'vi-VN'`
- `skill_level_code` skill_level_code not null
- `play_style_code` varchar null
- `primary_color` varchar null
- `secondary_color` varchar null
- `status` team_status not null default `'active'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_teams_city_skill` on `(home_city_code, skill_level_code)`

### team_members

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `user_id` uuid fk -> users.id
- `role` team_role not null default `'member'`
- `shirt_number` integer null
- `primary_position_code` position_code null
- `secondary_position_codes` jsonb not null default `'[]'`
- `joined_at` timestamptz not null
- `status` team_member_status not null default `'active'`
- `attendance_rate` numeric(5,2) not null default 0
- `current_debt_amount_minor` bigint not null default 0
- `currency_code` varchar(3) not null default `'VND'`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Unique:

- `(team_id, user_id)`

Indexes:

- `idx_team_members_team_role` on `(team_id, role)`

### team_invites

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `invite_type` invite_type not null
- `target_user_id` uuid null fk -> users.id
- `target_phone` varchar null
- `invite_code` varchar not null unique
- `status` invite_status not null default `'pending'`
- `expires_at` timestamptz not null
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null

## 6. Bảng player

### player_profiles

Columns:

- `id` uuid pk
- `user_id` uuid fk -> users.id unique
- `headline` varchar null
- `bio` text null
- `skill_level_code` skill_level_code not null
- `strong_foot` strong_foot null
- `primary_positions` jsonb not null default `'[]'`
- `secondary_positions` jsonb not null default `'[]'`
- `preferred_city_code` varchar null
- `preferred_district_code` varchar null
- `available_slots` jsonb not null default `'[]'`
- `spoken_languages` jsonb not null default `'[]'`
- `reputation_score` numeric(5,2) not null default 0
- `attendance_rate` numeric(5,2) not null default 0
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_player_profiles_city_skill` on `(preferred_city_code, skill_level_code)`

## 7. Bảng matchmaking

### match_posts

Tin đội đăng để tìm đối.

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `title` varchar null
- `match_type` match_type not null default `'friendly'`
- `status` match_post_status not null default `'open'`
- `urgency` urgency_level not null default `'normal'`
- `date` date not null
- `start_time` time not null
- `end_time` time null
- `timezone` varchar not null
- `country_code` varchar(2) not null
- `state_code` varchar null
- `city_code` varchar null
- `district_code` varchar null
- `venue_name` varchar null
- `venue_address` text null
- `field_type` field_type not null
- `team_skill_min` skill_level_code not null
- `team_skill_max` skill_level_code not null
- `pitch_fee_rule` pitch_fee_rule not null
- `support_note` varchar null
- `currency_code` varchar(3) not null default `'VND'`
- `note` text null
- `expires_at` timestamptz null
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_match_posts_discovery` on `(status, city_code, date, field_type)`
- `idx_match_posts_skill` on `(team_skill_min, team_skill_max)`

### match_invitations

Columns:

- `id` uuid pk
- `match_post_id` uuid fk -> match_posts.id
- `from_team_id` uuid fk -> teams.id
- `to_team_id` uuid fk -> teams.id
- `message` text null
- `status` invitation_status not null default `'sent'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### matches

Trận đã chốt hoặc trận phát sinh từ luồng tìm người.

Columns:

- `id` uuid pk
- `source_match_post_id` uuid null fk -> match_posts.id
- `home_team_id` uuid null fk -> teams.id
- `away_team_id` uuid null fk -> teams.id
- `match_type` match_type not null default `'friendly'`
- `status` match_status not null default `'scheduled'`
- `date` date not null
- `start_time` time not null
- `end_time` time null
- `timezone` varchar not null
- `country_code` varchar(2) not null
- `state_code` varchar null
- `city_code` varchar null
- `district_code` varchar null
- `venue_name` varchar null
- `venue_address` text null
- `field_type` field_type not null
- `currency_code` varchar(3) not null default `'VND'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_matches_team_date` on `(home_team_id, date)`
- `idx_matches_status_date` on `(status, date)`

### match_participants

Columns:

- `id` uuid pk
- `match_id` uuid fk -> matches.id
- `user_id` uuid fk -> users.id
- `team_id` uuid null fk -> teams.id
- `source_type` participant_source_type not null
- `role` participant_role not null default `'player'`
- `attendance_status` attendance_status not null default `'invited'`
- `position_code` position_code null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Unique:

- `(match_id, user_id)`

## 8. Bảng player hiring

### player_request_posts

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `match_id` uuid null fk -> matches.id
- `title` varchar null
- `status` player_request_status not null default `'open'`
- `urgency` urgency_level not null default `'normal'`
- `date` date not null
- `start_time` time not null
- `timezone` varchar not null
- `city_code` varchar null
- `district_code` varchar null
- `venue_name` varchar null
- `field_type` field_type not null
- `positions_needed` jsonb not null default `'[]'`
- `quantity` integer not null
- `skill_level_min` skill_level_code null
- `skill_level_max` skill_level_code null
- `support_fee_amount_minor` bigint not null default 0
- `currency_code` varchar(3) not null default `'VND'`
- `dress_note` varchar null
- `note` text null
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_player_request_posts_discovery` on `(status, city_code, date)`

### player_applications

Columns:

- `id` uuid pk
- `player_request_post_id` uuid fk -> player_request_posts.id
- `player_user_id` uuid fk -> users.id
- `message` text null
- `status` player_application_status not null default `'applied'`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Unique:

- `(player_request_post_id, player_user_id)`

## 9. Bảng reputation

### reviews

Columns:

- `id` uuid pk
- `match_id` uuid fk -> matches.id
- `reviewer_user_id` uuid fk -> users.id
- `target_type` review_target_type not null
- `target_team_id` uuid null fk -> teams.id
- `target_user_id` uuid null fk -> users.id
- `rating` numeric(3,2) not null
- `punctuality_score` numeric(3,2) null
- `attitude_score` numeric(3,2) null
- `fair_play_score` numeric(3,2) null
- `level_fit_score` numeric(3,2) null
- `note` text null
- `status` review_status not null default `'published'`
- `created_at` timestamptz not null

Constraints:

- một trong `target_team_id` hoặc `target_user_id` phải có giá trị hợp lệ theo `target_type`

### reputation_snapshots

Columns:

- `id` uuid pk
- `target_type` review_target_type not null
- `target_team_id` uuid null fk -> teams.id
- `target_user_id` uuid null fk -> users.id
- `reputation_score` numeric(5,2) not null default 0
- `reliability_score` numeric(5,2) not null default 0
- `punctuality_score` numeric(5,2) not null default 0
- `cancellation_rate` numeric(5,2) not null default 0
- `total_verified_matches` integer not null default 0
- `updated_at` timestamptz not null

## 10. Bảng voting

### polls

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `match_id` uuid null fk -> matches.id
- `type` poll_type not null
- `title` varchar not null
- `description` text null
- `audience_type` poll_audience_type not null
- `audience_snapshot` jsonb not null default `'[]'`
- `result_visibility` poll_result_visibility not null default `'after_deadline'`
- `allow_edit` boolean not null default false
- `require_note` boolean not null default false
- `deadline_at` timestamptz not null
- `status` poll_status not null default `'open'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_polls_team_status_deadline` on `(team_id, status, deadline_at)`

### poll_options

Columns:

- `id` uuid pk
- `poll_id` uuid fk -> polls.id
- `label_code` varchar null
- `label_text` varchar not null
- `sort_order` integer not null
- `created_at` timestamptz not null

### poll_votes

Columns:

- `id` uuid pk
- `poll_id` uuid fk -> polls.id
- `option_id` uuid fk -> poll_options.id
- `user_id` uuid fk -> users.id
- `note` text null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Unique:

- `(poll_id, user_id, option_id)`

Lưu ý:

- với poll single choice, cần enforce ở tầng service rằng một user chỉ có 1 option

## 11. Bảng finance

### team_fees

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `source_poll_id` uuid null fk -> polls.id
- `match_id` uuid null fk -> matches.id
- `title` varchar not null
- `description` text null
- `fee_type` fee_type not null
- `distribution_type` fee_distribution_type not null
- `currency_code` varchar(3) not null default `'VND'`
- `total_amount_minor` bigint not null
- `due_at` timestamptz not null
- `status` team_fee_status not null default `'open'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_team_fees_team_status_due` on `(team_id, status, due_at)`

### team_fee_assignees

Columns:

- `id` uuid pk
- `team_fee_id` uuid fk -> team_fees.id
- `user_id` uuid fk -> users.id
- `amount_due_minor` bigint not null
- `amount_paid_minor` bigint not null default 0
- `payment_status` payment_status not null default `'pending'`
- `paid_at` timestamptz null
- `waived_reason` text null
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Unique:

- `(team_fee_id, user_id)`

Indexes:

- `idx_team_fee_assignees_user_status` on `(user_id, payment_status)`

### payment_records

Columns:

- `id` uuid pk
- `team_fee_id` uuid fk -> team_fees.id
- `user_id` uuid fk -> users.id
- `amount_minor` bigint not null
- `currency_code` varchar(3) not null default `'VND'`
- `method` payment_method not null
- `status` payment_record_status not null default `'confirmed'`
- `reference_code` varchar null
- `proof_file_url` text null
- `confirmed_by` uuid null fk -> users.id
- `note` text null
- `paid_at` timestamptz not null
- `created_at` timestamptz not null

## 12. Bảng operations

### notifications

Columns:

- `id` uuid pk
- `user_id` uuid fk -> users.id
- `type` notification_type not null
- `priority` notification_priority not null default `'medium'`
- `title` varchar not null
- `body` text not null
- `related_entity_type` varchar null
- `related_entity_id` uuid null
- `is_read` boolean not null default false
- `read_at` timestamptz null
- `created_at` timestamptz not null

Indexes:

- `idx_notifications_user_created` on `(user_id, created_at desc)`

### reminder_jobs

Columns:

- `id` uuid pk
- `target_type` reminder_target_type not null
- `target_id` uuid not null
- `reminder_type` reminder_type not null
- `scheduled_at` timestamptz not null
- `status` reminder_status not null default `'pending'`
- `attempt_count` integer not null default 0
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### audit_logs

Columns:

- `id` uuid pk
- `actor_user_id` uuid null fk -> users.id
- `action` varchar not null
- `entity_type` varchar not null
- `entity_id` uuid not null
- `metadata` jsonb not null default `'{}'`
- `created_at` timestamptz not null

### settlement_exports

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `period_month` varchar not null
- `format` export_format not null default `'xlsx'`
- `file_url` text not null
- `status` export_status not null default `'ready'`
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null

## 13. Bảng commerce

### products

Columns:

- `id` uuid pk
- `name` varchar not null
- `slug` varchar not null unique
- `description` text null
- `category_code` varchar not null
- `status` product_status not null default `'active'`

## 14. Bảng media mở rộng trong tương lai

Phần này chưa cần triển khai ngay trong migration hiện tại, nhưng nên được xem là `planned domain` để sau này mở rộng không phải đập lại schema hồ sơ đội và hồ sơ cầu thủ.

### media_assets

Metadata gốc của ảnh và video.

Columns:

- `id` uuid pk
- `owner_type` media_owner_type not null
- `owner_id` uuid not null
- `media_type` media_type not null
- `storage_provider` storage_provider not null
- `storage_key` varchar not null
- `public_url` text not null
- `thumbnail_url` text null
- `mime_type` varchar not null
- `file_size_bytes` bigint not null
- `width` integer null
- `height` integer null
- `duration_seconds` integer null
- `processing_status` media_processing_status not null default `'pending'`
- `visibility` media_visibility not null default `'public'`
- `caption` varchar null
- `created_by` uuid fk -> users.id
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Indexes:

- `idx_media_assets_owner_created` on `(owner_type, owner_id, created_at desc)`
- `idx_media_assets_processing_status` on `(processing_status, created_at)`

### team_media

Liên kết media với hồ sơ đội.

Columns:

- `id` uuid pk
- `team_id` uuid fk -> teams.id
- `media_asset_id` uuid fk -> media_assets.id
- `media_role` media_role not null
- `sort_order` integer not null default `0`
- `is_featured` boolean not null default `false`
- `created_at` timestamptz not null

Unique:

- `(team_id, media_asset_id)`

Indexes:

- `idx_team_media_team_role_sort` on `(team_id, media_role, sort_order)`

### player_media

Liên kết media với hồ sơ cầu thủ.

Columns:

- `id` uuid pk
- `player_profile_id` uuid fk -> player_profiles.id
- `media_asset_id` uuid fk -> media_assets.id
- `media_role` media_role not null
- `sort_order` integer not null default `0`
- `is_featured` boolean not null default `false`
- `created_at` timestamptz not null

Unique:

- `(player_profile_id, media_asset_id)`

Indexes:

- `idx_player_media_profile_role_sort` on `(player_profile_id, media_role, sort_order)`

### media_moderation_logs

Columns:

- `id` uuid pk
- `media_asset_id` uuid fk -> media_assets.id
- `status` moderation_status not null
- `reason_code` varchar null
- `reviewed_by` uuid null fk -> users.id
- `note` text null
- `created_at` timestamptz not null

Indexes:

- `idx_media_moderation_media_created` on `(media_asset_id, created_at desc)`

### media_processing_jobs

Columns:

- `id` uuid pk
- `media_asset_id` uuid fk -> media_assets.id
- `job_type` media_job_type not null
- `status` job_status not null default `'pending'`
- `attempt_count` integer not null default `0`
- `last_error` text null
- `scheduled_at` timestamptz not null
- `started_at` timestamptz null
- `finished_at` timestamptz null
- `created_at` timestamptz not null

Indexes:

- `idx_media_processing_jobs_status_scheduled` on `(status, scheduled_at)`
- `idx_media_processing_jobs_media_asset` on `(media_asset_id, created_at desc)`

## 15. Đánh giá index hiện tại

### Kết luận ngắn

Index hiện tại `ổn cho MVP và closed beta`, nhưng chưa thể gọi là tối ưu cuối cùng cho production traffic lớn.

Nó đang ở trạng thái:

- đủ cho các query lõi đã biết
- chưa đủ cho mọi query dashboard, reminder, moderation và media trong tương lai
- cần bổ sung tiếp khi module được bật thật

### Nhóm đã ổn tương đối

- `users`: unique trên `phone`, `email`
- `user_identities`: unique trên `(provider, provider_subject)`
- `teams`: unique trên `slug`, `short_code`, index discovery theo `(home_city_code, skill_level_code)`
- `team_members`: unique `(team_id, user_id)` và index `(team_id, role)`
- `player_profiles`: index `(preferred_city_code, skill_level_code)`
- `match_posts`: index discovery theo `(status, city_code, date, field_type)`
- `polls`: index `(team_id, status, deadline_at)`
- `team_fees`: index `(team_id, status, due_at)`
- `team_fee_assignees`: unique `(team_fee_id, user_id)` và index `(user_id, payment_status)`
- `notifications`: index `(user_id, created_at desc)`

Các index này phù hợp với use case list/filter chính của MVP.

### Nhóm còn thiếu hoặc nên bổ sung sớm khi scale

- `team_invites`
  - nên thêm index `(team_id, status)`
  - nên thêm index `(target_phone)` nếu dùng invite theo số điện thoại nhiều
  - nên thêm index `(expires_at)` để cleanup job

- `match_invitations`
  - nên thêm unique `(match_post_id, from_team_id, to_team_id)` để chống gửi trùng
  - nên thêm index `(to_team_id, status, created_at desc)` cho inbox lời mời

- `matches`
  - nên thêm index `(away_team_id, date)`
  - nếu dashboard đội query cả home và away nhiều, nên cân nhắc materialized view hoặc denormalized team schedule sau này

- `match_participants`
  - nên thêm index `(user_id, attendance_status)`
  - nên thêm index `(team_id, match_id)` nếu team dashboard đọc danh sách người tham gia thường xuyên

- `player_request_posts`
  - nên thêm index `(status, district_code, date)`
  - nên thêm index `(created_by, created_at desc)` cho màn quản lý tin

- `player_applications`
  - nên thêm index `(player_user_id, status, created_at desc)` cho màn kèo đã ứng tuyển
  - nên thêm index `(player_request_post_id, status)` cho đội quản lý ứng viên

- `reviews`
  - nên thêm unique hoặc constraint business để hạn chế review trùng theo `(match_id, reviewer_user_id, target_type, target_team_id/target_user_id)`

- `reputation_snapshots`
  - nên thêm unique theo target để mỗi target chỉ có một snapshot active

- `poll_options`
  - nên thêm index `(poll_id, sort_order)`

- `poll_votes`
  - với poll single choice, unique hiện tại `(poll_id, user_id, option_id)` chưa đủ chặt
  - nếu poll single choice chiếm đa số, nên cân nhắc unique `(poll_id, user_id)` và xử lý multi-choice bằng bảng phụ hoặc flag logic rõ hơn
  - ít nhất nên thêm index `(poll_id, created_at)`

- `payment_records`
  - nên thêm index `(team_fee_id, paid_at desc)`
  - nên thêm index `(user_id, paid_at desc)`
  - nên thêm unique một phần cho `reference_code` nếu có provider external

- `reminder_jobs`
  - nên thêm index `(status, scheduled_at)`
  - nên thêm index `(target_type, target_id)`

- `audit_logs`
  - nên thêm index `(entity_type, entity_id, created_at desc)`
  - nên thêm index `(actor_user_id, created_at desc)`

- `settlement_exports`
  - nên thêm index `(team_id, period_month)`

- `products`
  - nên thêm index `(status, category_code)`

- `orders`
  - nên thêm index `(user_id, created_at desc)`
  - nên thêm index `(team_id, created_at desc)` nếu order gắn ngữ cảnh đội

### Kết luận thực tế

Nếu chỉ hỏi `ổn định chưa`, câu trả lời chính xác là:

- `ổn cho MVP`: có
- `ổn cho scale lớn mà không rà lại`: chưa

Đây là trạng thái bình thường. Index không nên chốt cứng hết từ đầu theo tưởng tượng, mà nên:

1. đặt chắc các index phục vụ flow lõi
2. thêm index theo query plan khi module thật được bật
3. theo dõi slow query trước khi traffic lớn
- `currency_code` varchar(3) not null default `'VND'`
- `base_price_minor` bigint not null
- `compare_at_price_minor` bigint null
- `primary_image_url` text null
- `stock_quantity` integer not null default 0
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### product_variants

Columns:

- `id` uuid pk
- `product_id` uuid fk -> products.id
- `sku` varchar not null unique
- `attributes` jsonb not null default `'{}'`
- `price_minor` bigint not null
- `stock_quantity` integer not null default 0
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### orders

Columns:

- `id` uuid pk
- `user_id` uuid fk -> users.id
- `team_id` uuid null fk -> teams.id
- `currency_code` varchar(3) not null default `'VND'`
- `subtotal_minor` bigint not null
- `discount_minor` bigint not null default 0
- `total_minor` bigint not null
- `status` order_status not null default `'pending'`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

### order_items

Columns:

- `id` uuid pk
- `order_id` uuid fk -> orders.id
- `product_id` uuid fk -> products.id
- `product_variant_id` uuid null fk -> product_variants.id
- `quantity` integer not null
- `unit_price_minor` bigint not null
- `line_total_minor` bigint not null
- `created_at` timestamptz not null

## 14. Enum đề xuất

### user_status

- `active`
- `suspended`
- `deleted`

### identity_provider

- `phone_otp`
- `google`
- `email`

### team_status

- `active`
- `archived`
- `suspended`

### team_role

- `captain`
- `vice_captain`
- `treasurer`
- `member`

### team_member_status

- `active`
- `invited`
- `pending_approval`
- `inactive`
- `removed`

### invite_type

- `link`
- `code`
- `phone`
- `user`

### invite_status

- `pending`
- `accepted`
- `expired`
- `revoked`

### skill_level_code

- `L1_CASUAL`
- `L2_RECREATIONAL`
- `L3_INTERMEDIATE`
- `L4_ADVANCED`
- `L5_COMPETITIVE`

### position_code

- `GK`
- `CB`
- `LB`
- `RB`
- `DM`
- `CM`
- `AM`
- `LW`
- `RW`
- `ST`

### strong_foot

- `left`
- `right`
- `both`

### match_type

- `friendly`
- `scrim`
- `tournament`

### field_type

- `5v5`
- `7v7`
- `11v11`

### urgency_level

- `normal`
- `high`
- `urgent`

### pitch_fee_rule

- `split_even`
- `home_team_pays`
- `away_team_pays`
- `negotiable`

### match_post_status

- `open`
- `pending_confirmation`
- `matched`
- `cancelled`
- `expired`

### invitation_status

- `sent`
- `viewed`
- `accepted`
- `declined`
- `expired`

### match_status

- `scheduled`
- `confirmed`
- `completed`
- `cancelled`

### participant_source_type

- `team_member`
- `freelance_player`
- `guest`

### participant_role

- `player`
- `captain`
- `goalkeeper`
- `manager`

### attendance_status

- `invited`
- `confirmed`
- `declined`
- `checked_in`
- `absent`

### player_request_status

- `open`
- `partially_filled`
- `filled`
- `closed`
- `cancelled`

### player_application_status

- `applied`
- `invited`
- `confirmed`
- `rejected`
- `cancelled`

### review_target_type

- `team`
- `player`

### review_status

- `published`
- `flagged`
- `hidden`

### poll_type

- `attendance`
- `approval`
- `single_choice`
- `multiple_choice`

### poll_audience_type

- `whole_team`
- `match_participants`
- `leadership_only`
- `custom`

### poll_result_visibility

- `immediate`
- `after_deadline`
- `admins_only`

### poll_status

- `open`
- `closed`
- `cancelled`

### fee_type

- `pitch`
- `tournament`
- `monthly_fund`
- `jersey`
- `other`

### fee_distribution_type

- `fixed_per_member`
- `split_even`
- `custom_amounts`

### team_fee_status

- `open`
- `partially_paid`
- `paid`
- `overdue`
- `cancelled`

### payment_status

- `pending`
- `paid`
- `overdue`
- `waived`
- `partially_paid`

### payment_method

- `bank_transfer`
- `cash`
- `wallet`
- `manual`

### payment_record_status

- `pending_confirmation`
- `confirmed`
- `rejected`

### notification_priority

- `low`
- `medium`
- `high`

### notification_type

- `match_invitation`
- `match_confirmed`
- `poll_created`
- `poll_deadline_reminder`
- `fee_created`
- `fee_due_reminder`
- `fee_overdue`
- `review_received`

### reminder_target_type

- `poll`
- `team_fee`
- `match`

### reminder_type

- `deadline_24h`
- `deadline_2h`
- `overdue_daily`
- `match_day`

### reminder_status

- `pending`
- `sent`
- `failed`
- `skipped`

### export_format

- `xlsx`
- `csv`

### export_status

- `queued`
- `processing`
- `ready`
- `failed`

### product_status

- `draft`
- `active`
- `archived`

### order_status

- `pending`
- `paid`
- `fulfilled`
- `cancelled`

## 15. Quan hệ chính

### Team và user

- một `team` có nhiều `team_members`
- một `user` có thể thuộc nhiều `teams`

### Team và match

- một `team` có thể tạo nhiều `match_posts`
- một `match` có thể có `home_team_id` và `away_team_id`

### Match và participant

- một `match` có nhiều `match_participants`
- một `participant` có thể là thành viên đội hoặc cầu thủ freelance

### Poll và finance

- một `poll` có thể sinh một hoặc nhiều `team_fees` theo service logic
- một `team_fee` có nhiều `team_fee_assignees`

### Review và reputation

- `reviews` là dữ liệu thô
- `reputation_snapshots` là dữ liệu tổng hợp

## 16. Ràng buộc nghiệp vụ quan trọng

- chỉ thành viên đội mới có thể nhận poll hoặc khoản thu của đội đó
- chỉ người có mặt trong `audience_snapshot` mới được vote
- chỉ người liên quan đến trận mới được review
- `team_fee_assignees.amount_paid_minor` không được vượt quá logic nghiệp vụ trừ khi cho phép overpay
- `match_post.team_skill_min` phải nhỏ hơn hoặc bằng `match_post.team_skill_max`
- `player_request_posts.quantity` phải lớn hơn 0

## 17. Index gợi ý cho performance

Ưu tiên index cho các màn discovery và dashboard:

- `match_posts(status, city_code, date)`
- `player_request_posts(status, city_code, date)`
- `team_members(team_id, role)`
- `polls(team_id, status, deadline_at)`
- `team_fees(team_id, status, due_at)`
- `notifications(user_id, created_at desc)`
- `team_fee_assignees(user_id, payment_status)`

## 18. Phần nên để JSONB

Chỉ dùng `jsonb` cho dữ liệu linh hoạt hoặc snapshot:

- `spoken_languages`
- `available_slots`
- `primary_positions` nếu lưu nhiều position
- `audience_snapshot`
- `secondary_position_codes`
- `attributes` của variant
- `notification_settings`

Không nên lạm dụng `jsonb` cho dữ liệu cần join/filter thường xuyên.

## 19. Audit và lịch sử thay đổi

Các bảng cần đặc biệt chú ý audit:

- `polls`
- `poll_votes`
- `team_fees`
- `payment_records`
- `team_members`

Nếu chưa có version tables, tối thiểu phải có `audit_logs`.

## 20. Mở rộng quốc tế

Schema đã chuẩn bị cho mở rộng thông qua:

- `preferred_locale`
- `timezone`
- `country_code`
- `currency_code`
- `skill_level_code`
- `position_code`

Điều này giúp hệ thống không bị phụ thuộc vào label tiếng Việt.

## 21. Mapping sang Prisma

Khi chuyển sang Prisma:

- dùng `@@index` cho các index discovery
- dùng `@@unique` cho composite unique
- enum có thể khai báo trong Prisma schema
- `jsonb` map sang `Json`
- bigint tiền tệ nên dùng `BigInt`

## 22. Khuyến nghị triển khai

Thứ tự dựng schema nên là:

1. identity
2. teams
3. player_profiles
4. match_posts / matches
5. polls
6. team_fees / payment_records
7. reviews
8. notifications / exports
9. commerce

Làm theo thứ tự này sẽ dễ migrate và dễ code MVP hơn.
