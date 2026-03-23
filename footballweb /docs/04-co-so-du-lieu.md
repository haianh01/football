# 04. Cơ Sở Dữ Liệu Và Prisma

## Công nghệ

- Database: `PostgreSQL`
- ORM: `Prisma`
- Schema file: [../apps/api/prisma/schema.prisma](../apps/api/prisma/schema.prisma)

## Enum hiện có

### `SkillLevel`

- `beginner`
- `intermediate`
- `advanced`

### `TeamRole`

- `captain`
- `manager`
- `member`

### `PitchType`

- `FIVE`
- `SEVEN`
- `ELEVEN`

### `MatchStatus`

- `draft`
- `open`
- `full`
- `completed`
- `cancelled`

### `UrgentPostStatus`

- `open`
- `closed`
- `expired`

### `ApplicationStatus`

- `pending`
- `accepted`
- `rejected`
- `cancelled`

## Bảng chính

### `User`

Thông tin user cơ bản:

- `name`
- `email`
- `phone`
- `avatarUrl`
- `homeDistrict`
- `skillLevel`
- `preferredPositions`

Quan hệ:

- có thể thuộc nhiều team qua `TeamMember`
- có thể tạo nhiều `Team`
- có thể tạo nhiều `Match`
- có thể apply nhiều `UrgentPost`

### `Team`

Thông tin đội:

- `name`
- `slug`
- `city`
- `district`
- `description`
- `skillLevel`
- `createdBy`

Quan hệ:

- có nhiều `members`
- có nhiều `matches`
- có nhiều `urgentPosts`

Rule quan trọng:

- người tạo đội sẽ tự được thêm vào `TeamMember` với role `captain`

### `TeamMember`

Bảng nối user với team:

- `teamId`
- `userId`
- `role`
- `joinedAt`

Rule:

- unique theo `(teamId, userId)`

### `Field`

Thông tin sân:

- `name`
- `address`
- `city`
- `district`
- `googleMapsUrl`
- `pitchType`
- `priceRange`
- `contactPhone`
- `verified`

### `Match`

Trận bóng của một đội:

- `teamId`
- `fieldId`
- `title`
- `startsAt`
- `endsAt`
- `district`
- `status`
- `notes`
- `createdBy`

Quan hệ:

- thuộc một `team`
- có thể gắn một `field`
- có thể có nhiều `urgentPosts`

### `UrgentPlayerPost`

Bài kèo gấp:

- `matchId`
- `teamId`
- `neededPlayers`
- `skillLevel`
- `feeShare`
- `description`
- `expiresAt`
- `status`

Rule:

- post phải thuộc đúng team của match

### `UrgentPostApplication`

Đơn apply vào bài kèo:

- `postId`
- `userId`
- `message`
- `status`
- `createdAt`

Rule:

- unique theo `(postId, userId)`

## Quan hệ tổng quát

```text
User -> TeamMember -> Team -> Match -> UrgentPlayerPost -> UrgentPostApplication
                     Team -> Field? qua Match.fieldId
```

## Index đáng chú ý

- `Team.district`
- `Field.district`
- `Match(teamId, startsAt)`
- `Match(district, startsAt)`
- `UrgentPlayerPost(status, expiresAt)`
- `UrgentPlayerPost.teamId`
- `UrgentPostApplication.status`

## Rule nghiệp vụ hiện đang có trong service

- chỉ `captain` mới được sửa đội
- chỉ `captain` mới được thêm thành viên
- chỉ `captain` mới được tạo hoặc sửa trận
- chỉ `captain` mới được tạo hoặc sửa kèo gấp
- chỉ `captain` mới được accept hoặc reject application
- khi số application accepted đủ `neededPlayers`, post tự đóng

## Những thứ schema chưa có

- session
- refresh token
- invite token
- RSVP tham gia trận
- cost split
- chat
- booking
- review và rating
