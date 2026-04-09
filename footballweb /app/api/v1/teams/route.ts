import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiCreated, apiError, apiOk } from "@/lib/http";

import { createTeam, getTeamDetail, listTeamsForUser, parseCreateTeamInput } from "@/features/team-management/service";

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();
    const teams = await listTeamsForUser(currentUser.id);

    return apiOk({
      items: teams,
      page: 1,
      page_size: teams.length,
      total_items: teams.length,
      total_pages: teams.length > 0 ? 1 : 0,
      current_user_id: currentUser.id
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentUser();
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseCreateTeamInput(body);
    const team = await createTeam(input, currentUser.id);
    const teamDetail = await getTeamDetail(team.id, currentUser.id);

    return apiCreated({
      team: {
        id: teamDetail.id,
        name: teamDetail.name,
        slug: teamDetail.slug,
        role_of_current_user: teamDetail.role_of_current_user
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
