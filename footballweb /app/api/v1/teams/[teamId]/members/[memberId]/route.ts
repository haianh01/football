import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { parseUpdateTeamMemberInput, updateTeamMember } from "@/features/team-management/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId, memberId } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const input = parseUpdateTeamMemberInput(body);
    const member = await updateTeamMember(teamId, memberId, currentUser.id, input);

    return apiOk(member);
  } catch (error) {
    return apiError(error);
  }
}
