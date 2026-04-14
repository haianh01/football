import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";
import { revokeTeamInvite } from "@/features/team-management/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ teamId: string; inviteId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId, inviteId } = await params;

    await revokeTeamInvite(teamId, inviteId, currentUser.id);

    return apiOk({
      team_id: teamId,
      invite_id: inviteId,
      revoked: true
    });
  } catch (error) {
    return apiError(error);
  }
}
