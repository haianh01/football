import type { TeamFeeSummary } from "@/features/team-finance";

export type MatchInvitationSummary = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  note: string | null;
  created_at: string;
  responded_at: string | null;
  match_post: {
    id: string;
    title: string | null;
    status: "open" | "pending_confirmation" | "matched" | "cancelled" | "expired";
    date: string;
    start_time: string;
    venue_name: string | null;
  };
  inviter_team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  };
  target_team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  };
  vote_count: number;
  has_voted_by_current_user: boolean;
  voters: Array<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  }>;
  fee: TeamFeeSummary | null;
};

export type MatchInvitationDashboardItem = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  inviter_team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  };
  match_post: {
    id: string;
    title: string | null;
    status: "open" | "pending_confirmation" | "matched" | "cancelled" | "expired";
    date: string;
    start_time: string;
    venue_name: string | null;
  };
};

export type MatchApiSuccess<T> = {
  data: T;
};

export type MatchApiFailure = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export type MatchInvitationApiSuccess<T> = MatchApiSuccess<T>;

export type MatchInvitationApiFailure = MatchApiFailure;

export type MatchSummary = {
  id: string;
  source_match_post_id: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  match_type: "friendly" | "tactical" | "mini_tournament";
  home_score: number | null;
  away_score: number | null;
  result_note: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  timezone: string;
  country_code: string;
  state_code: string | null;
  city_code: string | null;
  district_code: string | null;
  venue_name: string | null;
  venue_address: string | null;
  field_type: "five" | "seven" | "eleven";
  currency_code: string;
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
  participant_summary: {
    confirmed_count: number;
    pending_count: number;
  };
};

export type MatchParticipantSummary = {
  id: string;
  match_id: string;
  user_id: string;
  team_id: string | null;
  source_type: "team_member" | "freelance_player" | "guest";
  role: "player" | "captain" | "goalkeeper" | "manager";
  attendance_status: "invited" | "confirmed" | "declined" | "checked_in" | "absent";
  goals: number;
  assists: number;
  is_mvp: boolean;
  position_code: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  team: {
    id: string;
    name: string;
    short_code: string;
    logo_url: string | null;
  } | null;
};
