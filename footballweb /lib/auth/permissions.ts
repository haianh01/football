export const TEAM_ROLES = ["captain", "vice_captain", "treasurer", "member"] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export function canManageTeam(role: TeamRole) {
  return role === "captain" || role === "vice_captain";
}

export function canManageFinance(role: TeamRole) {
  return role === "captain" || role === "treasurer";
}

export function canCreatePoll(role: TeamRole) {
  return role === "captain" || role === "vice_captain";
}

