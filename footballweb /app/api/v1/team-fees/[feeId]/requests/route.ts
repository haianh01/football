import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { sendTeamFeeCollectionRequests } from "@/features/team-finance";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ feeId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { feeId } = await context.params;
    const fee = await sendTeamFeeCollectionRequests(feeId, currentUser.id);

    return apiOk(fee);
  } catch (error) {
    return apiError(error);
  }
}
