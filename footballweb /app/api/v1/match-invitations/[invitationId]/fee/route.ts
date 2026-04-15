import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiCreated, apiError } from "@/lib/http";

import { createTeamFeeFromInvitationVotes } from "@/features/team-finance";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ invitationId: string }>;
  }
) {
  try {
    const currentUser = await requireCurrentUser();
    const { invitationId } = await context.params;
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      amount_per_member_minor?: number;
      due_at?: string;
    };

    const fee = await createTeamFeeFromInvitationVotes(invitationId, currentUser.id, {
      title: body.title,
      description: body.description,
      amount_per_member_minor: Number(body.amount_per_member_minor),
      due_at: body.due_at ?? ""
    });

    return apiCreated(fee);
  } catch (error) {
    return apiError(error);
  }
}
