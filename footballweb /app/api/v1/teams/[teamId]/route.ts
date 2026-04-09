import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { getTeamDetail } from "@/features/team-management/service";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ teamId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId } = await context.params;
    const team = await getTeamDetail(teamId, currentUser.id);

    return apiOk(team);
  } catch (error) {
    return apiError(error);
  }
}

