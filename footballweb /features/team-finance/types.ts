export type TeamFeeAssigneeSummary = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  amount_due_minor: number;
  amount_paid_minor: number;
  payment_status: "pending" | "paid" | "overdue" | "waived" | "partially_paid";
  paid_at: string | null;
  request_count: number;
  last_requested_at: string | null;
};

export type TeamFeeSummary = {
  id: string;
  team_id: string;
  match_invitation_id: string | null;
  title: string;
  description: string | null;
  fee_type: "pitch" | "tournament" | "monthly_fund" | "jersey" | "other";
  distribution_type: "fixed_per_member" | "split_even" | "custom_amounts";
  currency_code: string;
  total_amount_minor: number;
  total_collected_minor: number;
  due_at: string;
  status: "open" | "partially_paid" | "paid" | "overdue" | "cancelled";
  created_at: string;
  assignee_count: number;
  paid_count: number;
  outstanding_count: number;
  overdue_count: number;
  last_requested_at: string | null;
  assignees: TeamFeeAssigneeSummary[];
};

export type CreateTeamFeeFromInvitationInput = {
  title?: string;
  description?: string;
  amount_per_member_minor: number;
  due_at: string;
};

export type UpdateTeamFeeAssigneePaymentInput = {
  payment_status: "pending" | "paid";
};

export type TeamFeeApiSuccess<T> = {
  data: T;
};

export type TeamFeeApiFailure = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};
