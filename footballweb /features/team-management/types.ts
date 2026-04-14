export type TeamInviteSummary = {
  id: string;
  team_id: string;
  invite_type: "link" | "code" | "phone" | "user";
  invite_code: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
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
