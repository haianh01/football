import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { parseUpdateMatchParticipantStatsInput, updateMatchParticipantStats } from "@/features/matchmaking";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string; participantId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const { matchId, participantId } = await params;
    const input = parseUpdateMatchParticipantStatsInput(body);
    const data = await updateMatchParticipantStats(matchId, participantId, input, currentUser.id);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
