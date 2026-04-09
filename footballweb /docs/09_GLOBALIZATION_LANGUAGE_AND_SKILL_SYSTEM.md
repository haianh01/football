# Globalization Language And Skill System

## 1. Mục tiêu

Tài liệu này chốt cách thiết kế sản phẩm để có thể mở rộng từ Việt Nam ra thị trường quốc tế mà không phải sửa lại toàn bộ dữ liệu, UI và logic tìm kiếm.

Nó tập trung vào 2 phần:

- chiến lược đa ngôn ngữ
- chuẩn hóa hệ thống `skill level` cho đội và cầu thủ

## 2. Nguyên tắc mở rộng toàn cầu

- không hard-code text theo tiếng Việt trong logic dữ liệu
- mọi nhãn hiển thị phải đi qua hệ thống i18n
- các giá trị domain phải dùng `code` ổn định, không dùng label bản địa làm dữ liệu gốc
- ngày giờ, tiền tệ, đơn vị đo phải render theo locale
- vị trí thi đấu, skill level, role, trạng thái phải có taxonomy chung toàn cầu

## 3. Chiến lược ngôn ngữ

### 3.1 Ngôn ngữ sản phẩm giai đoạn đầu

Khuyến nghị:

- `vi-VN` là ngôn ngữ mặc định để launch
- `en` là ngôn ngữ nền bắt buộc trong hệ thống key và tài liệu

Lý do:

- Việt Nam là thị trường vào đầu tiên
- English nên là ngôn ngữ trung gian để mở rộng sang các nước khác nhanh hơn

### 3.2 Lộ trình ngôn ngữ gợi ý

#### Giai đoạn 1

- `vi-VN`
- `en`

#### Giai đoạn 2

- `th-TH`
- `id-ID`

#### Giai đoạn 3

- `pt-BR`
- `es`
- `ja-JP`
- `ko-KR`

Không cần hỗ trợ toàn bộ ngay từ đầu, nhưng kiến trúc phải sẵn cho việc thêm locale mới.

## 4. Quy tắc i18n cho frontend

- mọi text UI dùng translation key
- không ghép chuỗi thủ công trong component
- pluralization phải đi qua formatter
- ngày giờ dùng locale formatter
- tiền tệ dùng currency formatter
- không hard-code label như `Quận 7`, `Tối`, `Khá`, `Sân 7` trong dữ liệu gốc

Ví dụ:

```text
match.filters.skill.intermediate
team.roles.captain
poll.type.attendance
finance.status.overdue
```

## 5. Dữ liệu locale cần có

### User

- `preferred_locale`
- `spoken_languages`
- `timezone`
- `country_code`

### Team

- `default_locale`
- `home_country_code`
- `home_city_code`

### Venue / Match

- `timezone`
- `country_code`
- `city_code`
- `currency_code`

## 6. Chuẩn hóa hệ thống skill level

Nếu mở rộng quốc tế, không nên lưu skill bằng text như:

- yếu
- khá
- mạnh

Vì các nhãn này khác nhau giữa quốc gia và khó filter nhất quán.

Phải dùng `skill_level_code` làm dữ liệu chuẩn, còn label hiển thị sẽ dịch theo locale.

## 7. Skill taxonomy đề xuất

### 7.1 Team skill level

- `L1_CASUAL`
- `L2_RECREATIONAL`
- `L3_INTERMEDIATE`
- `L4_ADVANCED`
- `L5_COMPETITIVE`

### 7.2 Player skill level

- `L1_BEGINNER`
- `L2_CASUAL`
- `L3_INTERMEDIATE`
- `L4_STRONG`
- `L5_HIGH_COMPETITIVE`

### 7.3 Cách hiển thị theo locale

#### vi-VN

- L1: Mới chơi / vui là chính
- L2: Phong trào cơ bản
- L3: Trung bình khá
- L4: Khá - mạnh
- L5: Cạnh tranh cao

#### en

- L1: Beginner / Casual
- L2: Recreational
- L3: Intermediate
- L4: Advanced
- L5: Competitive

## 8. Quy tắc dùng skill trong sản phẩm

### Tìm đối

- `team.skill_level_code` phải là field filter chuẩn
- cho phép chọn khoảng skill, ví dụ `L3-L4`

### Tìm người đá thuê

- `player.skill_level_code` phải dùng để match với yêu cầu trận
- có thể thêm `skill_confidence_score` về sau nếu cần

### Review

- review không nên chỉ nói người đó mạnh hay yếu
- nên có field `level_fit_score`, tức người đó có phù hợp với mức trận hay không

## 9. Chuẩn hóa vị trí thi đấu

Không lưu text tự do như `tiền đạo`, `striker`, `CF`, `ST` lẫn lộn.

Phải có position code:

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

Label hiển thị sẽ phụ thuộc locale.

## 10. Chuẩn hóa khu vực và địa lý

Để mở rộng toàn cầu, không nên thiết kế filter chỉ xoay quanh `quận/huyện`.

Phải có mô hình địa lý nhiều cấp:

- country
- state_or_province
- city
- district
- venue

Việt Nam có thể hiển thị quận/huyện, nhưng các nước khác có thể dùng borough, ward hoặc city zone.

## 11. Chuẩn hóa tiền tệ và thanh toán

Finance và commerce phải lưu:

- `currency_code`
- `amount_minor`
- `exchange_reference` nếu cần sau này

Không nên lưu duy nhất kiểu hiển thị `50.000đ`.

Phải tách:

- value dữ liệu
- format hiển thị

## 12. Ảnh hưởng tới data model

### User

- id
- preferred_locale
- spoken_languages
- timezone
- country_code

### Team

- id
- default_locale
- home_country_code
- home_city_code
- skill_level_code

### PlayerProfile

- id
- skill_level_code
- primary_positions
- secondary_positions
- spoken_languages

### MatchPost

- id
- locale
- timezone
- currency_code
- team_skill_min
- team_skill_max

## 13. Ảnh hưởng tới UI/UX

### Trang tìm đối

Thay vì hard-code:

- `TRÌNH ĐỘ: KHÁ`

Nên hiển thị từ taxonomy:

- `L3-L4`
- label dịch theo locale

### Trang hồ sơ cầu thủ

Phải có:

- ngôn ngữ giao tiếp
- skill level chuẩn hóa
- vị trí chuẩn hóa

### Dashboard đội

Nếu đội có thành viên quốc tế:

- hiển thị language preference
- hỗ trợ poll song ngữ hoặc fallback tiếng Anh

## 14. Bổ sung còn thiếu trong bộ docs hiện tại

Đây là những thứ các file trước chưa tách riêng:

- chiến lược `vi launch, en as backbone`
- taxonomy skill toàn cầu
- chuẩn hóa locale, timezone, currency
- spoken languages cho user và player
- position code và geo hierarchy

## 15. Khuyến nghị kỹ thuật

- dùng message catalog theo locale
- dùng `locale-aware routing` nếu cần public SEO
- lưu tất cả enum nghiệp vụ bằng code tiếng Anh
- label hiển thị map từ code sang translation
- không dùng text hiển thị làm giá trị API

## 16. Kết luận

Nếu muốn đi xa hơn Việt Nam, phải chốt từ đầu:

- dữ liệu gốc bằng code ổn định
- hiển thị bằng translation
- skill level không phụ thuộc ngôn ngữ
- địa lý, thời gian và tiền tệ đều locale-aware

Nếu không làm bước này sớm, sau này mở rộng quốc tế sẽ phải sửa từ UI đến database.
