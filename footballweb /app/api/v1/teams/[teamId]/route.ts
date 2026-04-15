import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { getTeamDetail, parseUpdateTeamInput, updateTeam } from "@/features/team-management/service";

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

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ teamId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const input = parseUpdateTeamInput(body);
    const team = await updateTeam(teamId, currentUser.id, input);

    return apiOk(team);
  } catch (error) {
    return apiError(error);
  }
}
