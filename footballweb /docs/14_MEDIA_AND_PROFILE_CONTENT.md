# Media Và Nội Dung Hồ Sơ Mở Rộng

## 1. Mục đích tài liệu

Tài liệu này mô tả hướng mở rộng trong tương lai cho tính năng:

- đội bóng đăng ảnh giới thiệu
- đội bóng đăng video giới thiệu
- cầu thủ freelance đăng ảnh hồ sơ mở rộng
- cầu thủ freelance đăng video highlight hoặc video intro

Mục tiêu của tài liệu là `khóa trước kiến trúc`, chưa triển khai ngay trong code. Khi cần mở rộng sau này, team có thể dùng lại tài liệu này để triển khai mà không phải thiết kế lại từ đầu.

## 2. Mục tiêu sản phẩm

Tính năng media hồ sơ phục vụ 4 giá trị chính:

- tăng độ tin cậy của đội bóng và cầu thủ
- giúp người xem đánh giá nhanh phong cách chơi và mức độ nghiêm túc
- tăng khả năng giới thiệu bản thân cho cầu thủ đá thuê
- tạo nền cho feed cộng đồng, bài đăng, highlight và social proof trong tương lai

## 3. Những gì tính năng này không phải

Trong giai đoạn đầu, tính năng này không nên bị hiểu thành:

- mạng xã hội video ngắn
- nền tảng livestream
- kho video không giới hạn
- hệ thống chat media nặng

Định hướng đúng là:

- media gắn với `hồ sơ đội`
- media gắn với `hồ sơ cầu thủ`
- media gắn với `giới thiệu năng lực`, `uy tín`, `highlight`

## 4. Use case chính

### Đội bóng

- upload logo chất lượng cao
- upload ảnh bìa đội
- upload gallery ảnh đội
- upload video intro đội
- upload highlight các trận tiêu biểu

### Cầu thủ

- upload avatar chuẩn hơn
- upload gallery cá nhân
- upload video giới thiệu bản thân
- upload video highlight thi đấu
- upload clip bắt penalty, chuyền bóng, dứt điểm hoặc kỹ năng theo vị trí

### Người xem

- xem media ngay trong hồ sơ đội
- xem media ngay trong hồ sơ cầu thủ
- đánh giá nhanh mức độ nghiêm túc trước khi nhận kèo hoặc mời cầu thủ

## 5. Phạm vi MVP tương lai

Khi bắt đầu làm tính năng này, không nên làm toàn bộ ngay. Nên chia theo thứ tự:

### Phase A

- upload nhiều ảnh cho hồ sơ đội
- upload một ảnh bìa cho hồ sơ đội
- upload nhiều ảnh cho hồ sơ cầu thủ
- gắn media vào hồ sơ và hiển thị gallery đơn giản

### Phase B

- upload 1 video intro cho đội
- upload 1 video intro cho cầu thủ
- tạo thumbnail video
- hiển thị preview và player cơ bản

### Phase C

- nhiều video highlight
- sort thứ tự media
- pin media nổi bật
- moderation và quota nâng cao
- mở rộng sang post/feed nếu cần

## 6. Tác động tới kiến trúc hiện tại

Kiến trúc hiện tại đủ tốt để mở rộng, vì hệ thống đã có:

- domain tách riêng cho `Team`, `PlayerProfile`, `Reputation`, `Notifications`
- định hướng `object storage` trong tech stack
- chỗ để thêm queue cho xử lý nền
- profile đội và profile cầu thủ là các thực thể độc lập

Nhưng implementation hiện tại chưa sẵn sàng để chạy media lớn ở production, vì còn thiếu:

- object storage thật
- signed upload
- background processing cho video
- thumbnail pipeline
- quota và moderation
- policy lưu trữ file

Kết luận:

- `về kiến trúc`: có thể mở rộng tốt
- `về code hiện tại`: mới là nền để đi tiếp, chưa phải media-ready

## 7. Domain mở rộng nên thêm

Không nên nhét ảnh và video trực tiếp vào bảng `teams` hoặc `player_profiles` dưới dạng nhiều cột mới.

Nên thêm một domain riêng: `Media & Profile Content`

Domain này nên gồm các khái niệm:

- `MediaAsset`
- `TeamMedia`
- `PlayerMedia`
- `MediaModeration`
- `MediaProcessingJob`

Nếu sau này muốn mở rộng thêm social/feed thì có thể thêm:

- `Post`
- `PostMedia`

## 8. Mô hình dữ liệu đề xuất

### MediaAsset

Lưu record gốc của file media.

Trường dữ liệu đề xuất:

- `id`
- `owner_type`
- `owner_id`
- `media_type`
- `storage_provider`
- `storage_key`
- `public_url`
- `thumbnail_url`
- `mime_type`
- `file_size_bytes`
- `width`
- `height`
- `duration_seconds`
- `processing_status`
- `visibility`
- `caption`
- `created_by`
- `created_at`
- `updated_at`

### TeamMedia

Liên kết media với đội bóng.

Trường dữ liệu đề xuất:

- `id`
- `team_id`
- `media_asset_id`
- `media_role`
- `sort_order`
- `is_featured`

### PlayerMedia

Liên kết media với cầu thủ.

Trường dữ liệu đề xuất:

- `id`
- `player_profile_id`
- `media_asset_id`
- `media_role`
- `sort_order`
- `is_featured`

### MediaModeration

Ghi trạng thái kiểm duyệt.

Trường dữ liệu đề xuất:

- `id`
- `media_asset_id`
- `status`
- `reason_code`
- `reviewed_by`
- `reviewed_at`
- `note`

### MediaProcessingJob

Theo dõi xử lý nền cho video.

Trường dữ liệu đề xuất:

- `id`
- `media_asset_id`
- `job_type`
- `status`
- `attempt_count`
- `last_error`
- `started_at`
- `finished_at`

## 9. Enum gợi ý

### owner_type

- `team`
- `player_profile`
- `user`

### media_type

- `image`
- `video`

### media_role

Áp dụng linh hoạt theo team hoặc player:

- `avatar`
- `cover`
- `gallery`
- `intro`
- `highlight`

### processing_status

- `pending`
- `uploaded`
- `processing`
- `ready`
- `failed`

### visibility

- `public`
- `team_only`
- `private`

### moderation_status

- `pending`
- `approved`
- `rejected`

## 10. Quy tắc nghiệp vụ

- Mỗi đội chỉ có `1 cover` đang active tại một thời điểm.
- Mỗi đội có thể có nhiều gallery images.
- Mỗi đội nên có tối đa `1 intro video` trong phase đầu.
- Mỗi cầu thủ nên có tối đa `1 intro video` trong phase đầu.
- Highlight video có thể nhiều record nhưng nên có giới hạn quota.
- Chỉ captain hoặc role được phân quyền mới được sửa media của đội.
- Cầu thủ chỉ được sửa media trong hồ sơ của chính mình.
- Video chỉ hiển thị công khai sau khi upload xong và trạng thái `ready`.
- File bị moderation `rejected` không hiển thị ra public profile.

## 11. Luồng upload đề xuất

### Ảnh

1. Client xin upload permission
2. Server tạo signed upload
3. Client upload trực tiếp lên storage
4. Server tạo `MediaAsset`
5. Server gắn vào `TeamMedia` hoặc `PlayerMedia`
6. UI hiển thị gallery

### Video

1. Client xin upload permission
2. Server tạo signed upload
3. Client upload video lên storage
4. Server tạo `MediaAsset` với trạng thái `uploaded`
5. Queue tạo job xử lý nền
6. Worker tạo thumbnail và output playback
7. `processing_status` chuyển sang `ready`
8. UI hiển thị video preview

## 12. Tại sao không nên lưu media trực tiếp trong DB

Không nên lưu ảnh/video thật trong database chính vì:

- DB sẽ phình rất nhanh
- backup và restore nặng
- chi phí cao
- query profile bị ảnh hưởng
- video processing không phù hợp với relational DB

Cách đúng là:

- DB chỉ lưu metadata
- file nằm ở object storage
- app render qua `public_url` hoặc signed URL

## 13. Ảnh hưởng tới profile UI

### Hồ sơ đội

Nên có các vùng:

- logo
- cover image
- gallery
- video intro
- highlight nổi bật

### Hồ sơ cầu thủ

Nên có các vùng:

- avatar
- gallery cá nhân
- video intro
- highlight theo vị trí

### Matchmaking / Player hiring

Không nên auto render video nặng ngay trong list. Ở list chỉ nên hiển thị:

- avatar/logo
- cover thumbnail nếu cần
- badge có media hay không

Video và gallery đầy đủ chỉ mở trong trang detail/profile.

## 14. Tác động tới trust system

Media không nên thay thế review và uy tín. Media chỉ là lớp bổ sung.

Trust của hệ thống vẫn phải dựa chủ yếu vào:

- số trận
- tỷ lệ giữ kèo
- tỷ lệ đúng giờ
- đánh giá sau trận
- lịch sử tham gia

Media đóng vai trò:

- giúp đánh giá phong cách
- giúp tăng độ tin cậy cảm nhận
- giúp profile có chiều sâu hơn

## 15. Tác động tới scale

Khi thêm media, hệ thống sẽ tăng tải ở các điểm sau:

- dung lượng lưu trữ
- bandwidth
- CPU cho video processing
- queue jobs
- moderation workload

Vì vậy đây là nhóm tính năng bắt buộc phải tách khỏi flow request đồng bộ thông thường.

Cần áp dụng:

- object storage
- CDN khi bắt đầu có traffic media thật
- background workers
- quota theo owner
- giới hạn định dạng và dung lượng

## 16. Quota gợi ý cho phase đầu

### Team

- tối đa 1 logo
- tối đa 1 cover
- tối đa 12 gallery images
- tối đa 1 intro video
- tối đa 3 highlight videos

### Player

- tối đa 1 avatar
- tối đa 8 gallery images
- tối đa 1 intro video
- tối đa 3 highlight videos

Giới hạn này nên để config được bằng env hoặc admin settings.

## 17. Moderation tối thiểu cần có

Ngay cả khi chưa làm AI moderation, vẫn nên có các rule cơ bản:

- giới hạn MIME type
- giới hạn dung lượng
- chặn file lỗi hoặc không đọc được
- cờ báo cáo nội dung
- admin có thể ẩn media

Nếu sau này scale lớn hơn, có thể thêm:

- image safety checks
- video moderation
- duplicate detection

## 18. API gợi ý cho tương lai

### Upload & media

- `POST /api/v1/media/upload-intents`
- `POST /api/v1/teams/{teamId}/media`
- `POST /api/v1/player-profiles/{profileId}/media`
- `PATCH /api/v1/media/{mediaId}`
- `DELETE /api/v1/media/{mediaId}`

### Read

- `GET /api/v1/teams/{teamId}/media`
- `GET /api/v1/player-profiles/{profileId}/media`

### Moderation

- `POST /api/v1/media/{mediaId}/report`
- `PATCH /api/v1/admin/media/{mediaId}/moderation`

## 19. Ảnh hưởng tới docs và schema hiện tại

Khi bắt đầu triển khai tính năng này, cần cập nhật thêm:

- `11_DATABASE_SCHEMA.md`
- `12_PRISMA_SCHEMA_DRAFT.prisma`
- `13_API_CONTRACTS.md`
- `10_TECH_STACK.md`

Nếu mở rộng tiếp sang feed hoặc post, cần tạo thêm docs riêng cho `content feed`.

## 20. Khuyến nghị triển khai

Thời điểm hiện tại chưa cần code ngay tính năng này.

Việc nên làm bây giờ là:

- giữ thiết kế profile đủ linh hoạt để sau này có vùng media
- không hard-code profile chỉ có một avatar/logo
- giữ hướng upload hiện tại ở mức tạm thời
- chốt trước domain và data model như tài liệu này

Khi bắt đầu phase media thật, thứ tự nên là:

1. ảnh hồ sơ đội và cầu thủ
2. gallery
3. video intro một file
4. thumbnail + processing
5. moderation + quota

## 21. Kết luận

Hệ thống hiện tại đã được thiết kế theo hướng `có thể mở rộng` cho ảnh và video giới thiệu trong tương lai, nhưng mới dừng ở mức chuẩn bị kiến trúc.

Để mở rộng đúng cách sau này:

- phải tách media thành domain riêng
- phải lưu file ngoài DB
- phải xử lý video bất đồng bộ
- phải gắn media với profile đội và profile cầu thủ như một lớp bổ sung cho trust

Tài liệu này là mốc thiết kế để khi cần triển khai, team có thể kéo ra dùng ngay mà không phải thiết kế lại từ đầu.
