import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";
import { acceptTeamInvite } from "@/features/team-management/service";

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentUser();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const inviteCode = typeof body.invite_code === "string" ? body.invite_code : "";
    const data = await acceptTeamInvite(inviteCode, currentUser.id);

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
