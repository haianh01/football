import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiCreated, apiError, apiOk } from "@/lib/http";
import { createMatchInvitation, listMatchPostInvitations } from "@/features/matchmaking";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchPostId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchPostId } = await params;
    const invitations = await listMatchPostInvitations(matchPostId, currentUser.id);

    return apiOk({
      items: invitations,
      page: 1,
      page_size: invitations.length,
      total_items: invitations.length,
      total_pages: invitations.length > 0 ? 1 : 0
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchPostId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchPostId } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const inviterTeamId = typeof body.inviter_team_id === "string" ? body.inviter_team_id : "";
    const note = typeof body.note === "string" ? body.note : undefined;
    const invitation = await createMatchInvitation(
      {
        match_post_id: matchPostId,
        inviter_team_id: inviterTeamId,
        note
      },
      currentUser.id
    );

    return apiCreated(invitation);
  } catch (error) {
    return apiError(error);
  }
}
