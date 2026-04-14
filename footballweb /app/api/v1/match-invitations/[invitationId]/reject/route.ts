import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";
import { rejectMatchInvitation } from "@/features/matchmaking";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { invitationId } = await params;
    const invitation = await rejectMatchInvitation(invitationId, currentUser.id);

    return apiOk(invitation);
  } catch (error) {
    return apiError(error);
  }
}
