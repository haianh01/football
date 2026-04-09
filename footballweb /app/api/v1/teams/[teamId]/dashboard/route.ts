import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { getTeamDashboard } from "@/features/team-management/service";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ teamId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId } = await context.params;
    const dashboard = await getTeamDashboard(teamId, currentUser.id);

    return apiOk(dashboard);
  } catch (error) {
    return apiError(error);
  }
}

