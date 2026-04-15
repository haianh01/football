import type { TeamFeeSummary } from "@/features/team-finance";
import type { MatchInvitationDashboardItem } from "@/features/matchmaking/types";

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

export type TeamDashboardUpcomingMatch = {
  id: string;
  source_match_post_id: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  date: string;
  start_time: string;
  end_time: string | null;
  venue_name: string | null;
  field_type: "five" | "seven" | "eleven";
  home_team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  } | null;
  away_team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  } | null;
  current_team_available_count: number;
  current_team_required_players: number;
  current_team_shortage: number;
};

export type TeamDashboard = {
  team_summary: TeamSummary;
  action_center: {
    pending_confirmations: number;
    open_polls: number;
    overdue_fee_assignees: number;
    upcoming_match_shortage: number;
  };
  upcoming_matches: TeamDashboardUpcomingMatch[];
  pending_match_invitations: MatchInvitationDashboardItem[];
  open_polls: [];
  open_fees: TeamFeeSummary[];
  member_summary: {
    active_members: number;
    average_attendance_rate: number;
  };
  members: TeamDashboardMember[];
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
