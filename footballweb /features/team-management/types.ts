export type TeamInviteSummary = {
  id: string;
  team_id: string;
  invite_type: "link" | "code" | "phone" | "user";
  invite_code: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
};

export type TeamSummary = {
  id: string;
  name: string;
  short_code: string;
  logo_url: string | null;
  description: string | null;
  home_city_code: string | null;
  home_district_code: string | null;
  skill_level_code: "L1_CASUAL" | "L2_RECREATIONAL" | "L3_INTERMEDIATE" | "L4_ADVANCED" | "L5_COMPETITIVE";
  play_style_code: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  member_count: number;
  role_of_current_user: "captain" | "vice_captain" | "treasurer" | "member" | null;
};

export type TeamDashboardMember = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: "captain" | "vice_captain" | "treasurer" | "member";
  status: "active" | "invited" | "pending_approval" | "inactive" | "removed";
  attendance_rate: number;
  current_debt_amount_minor: number;
  currency_code: string;
  joined_at: string;
};

export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};
