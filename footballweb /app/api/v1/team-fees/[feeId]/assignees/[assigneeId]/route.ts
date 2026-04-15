import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";

import { updateTeamFeeAssigneePaymentStatus } from "@/features/team-finance";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ feeId: string; assigneeId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { feeId, assigneeId } = await context.params;
    const body = (await request.json()) as {
      payment_status?: "pending" | "paid";
    };
    const fee = await updateTeamFeeAssigneePaymentStatus(feeId, assigneeId, currentUser.id, {
      payment_status: body.payment_status ?? "pending"
    });

    return apiOk(fee);
  } catch (error) {
    return apiError(error);
  }
}
