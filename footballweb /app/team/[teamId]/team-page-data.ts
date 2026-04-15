import { cache } from "react";

import { requirePageUser } from "@/lib/auth/current-user";
import { getTeamDashboard, listTeamInvites } from "@/features/team-management/service";

export const getTeamPageData = cache(async (teamId: string) => {
  const currentUser = await requirePageUser(`/login?redirectTo=/team/${teamId}`);
  const dashboard = await getTeamDashboard(teamId, currentUser.id);
  const invites =
    dashboard.team_summary.role_of_current_user === "captain"
      ? await listTeamInvites(teamId, currentUser.id)
      : [];
  const canManageFinance =
    dashboard.team_summary.role_of_current_user === "captain" ||
    dashboard.team_summary.role_of_current_user === "treasurer";
  const canManageSettings = dashboard.team_summary.role_of_current_user === "captain";

  return {
    currentUser,
    dashboard,
    invites,
    canManageFinance,
    canManageSettings
  };
});

export type TeamPageData = Awaited<ReturnType<typeof getTeamPageData>>;
