import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiCreated, apiError, apiOk } from "@/lib/http";

import { createTeamInvite, listTeamInvites } from "@/features/team-management/service";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId } = await params;
    const invites = await listTeamInvites(teamId, currentUser.id);

    return apiOk({
      items: invites,
      page: 1,
      page_size: invites.length,
      total_items: invites.length,
      total_pages: invites.length > 0 ? 1 : 0
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const currentUser = await requireCurrentUser();
    const { teamId } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const expiresInDaysRaw = body.expires_in_days;
    const expiresInDays =
      typeof expiresInDaysRaw === "number"
        ? expiresInDaysRaw
        : typeof expiresInDaysRaw === "string"
          ? Number(expiresInDaysRaw)
          : undefined;

    const invite = await createTeamInvite(teamId, currentUser.id, {
      expiresInDays: typeof expiresInDays === "number" && Number.isFinite(expiresInDays) ? expiresInDays : undefined
    });

    return apiCreated({ invite });
  } catch (error) {
    return apiError(error);
  }
}

