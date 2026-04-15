import { getMatchDetail, parseUpdateMatchInput, updateMatch } from "@/features/matchmaking";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchId } = await params;
    const data = await getMatchDetail(matchId, currentUser.id);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchId } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const input = parseUpdateMatchInput(body);
    const data = await updateMatch(matchId, currentUser.id, input);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
