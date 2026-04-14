import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";
import { listMatchParticipants } from "@/features/matchmaking";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchId } = await params;
    const data = await listMatchParticipants(matchId, currentUser.id);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
