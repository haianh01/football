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

export type MatchInvitationApiSuccess<T> = {
  data: T;
};

export type MatchInvitationApiFailure = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
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
