export const urgentPosts = [
  {
    id: 'post-1',
    title: 'Thiếu 2 người đá sân 7 tối nay',
    teamName: 'FC Office Prime',
    district: 'Cầu Giấy',
    startsAt: '2026-03-19T20:00:00+07:00',
    neededPlayers: 2,
    skillLevel: 'intermediate',
    feeShare: '80.000 VND',
    status: 'open',
  },
  {
    id: 'post-2',
    title: 'Cần 1 trung vệ cho kèo giao hữu',
    teamName: 'Mydinh Warriors',
    district: 'Nam Từ Liêm',
    startsAt: '2026-03-20T19:30:00+07:00',
    neededPlayers: 1,
    skillLevel: 'advanced',
    feeShare: '100.000 VND',
    status: 'open',
  },
  {
    id: 'post-3',
    title: 'Kèo vui cuối tuần, ưu tiên đá chắc',
    teamName: 'Seven Lakes FC',
    district: 'Thanh Xuân',
    startsAt: '2026-03-22T18:00:00+07:00',
    neededPlayers: 3,
    skillLevel: 'beginner',
    feeShare: '60.000 VND',
    status: 'open',
  },
] as const;

export const fields = [
  {
    id: 'field-1',
    name: 'San bong My Dinh Arena',
    district: 'Nam Từ Liêm',
    address: '12 Le Duc Tho, Ha Noi',
    pitchType: '7',
    priceRange: '700.000 - 900.000 VND',
    verified: true,
  },
  {
    id: 'field-2',
    name: 'Cau Giay Football Hub',
    district: 'Cầu Giấy',
    address: '89 Tran Thai Tong, Ha Noi',
    pitchType: '7',
    priceRange: '650.000 - 850.000 VND',
    verified: true,
  },
  {
    id: 'field-3',
    name: 'Thanh Xuan Mini Stadium',
    district: 'Thanh Xuân',
    address: '44 Nguyen Tuan, Ha Noi',
    pitchType: '7',
    priceRange: '600.000 - 750.000 VND',
    verified: false,
  },
] as const;

export const skillLevelLabels = {
  beginner: 'Mới chơi',
  intermediate: 'Trung bình',
  advanced: 'Khá',
} as const;

export const urgentPostStatusLabels = {
  open: 'Đang mở',
  closed: 'Đã đủ người',
  expired: 'Hết hạn',
} as const;

export const verifiedLabels = {
  true: 'Đã xác minh',
  false: 'Chưa xác minh',
} as const;
