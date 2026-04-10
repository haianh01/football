import { apiError, apiOk } from "@/lib/http";
import { getMatchPostDetail } from "@/features/matchmaking";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchPostId: string }> }
) {
  try {
    const { matchPostId } = await params;
    const data = await getMatchPostDetail(matchPostId);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
