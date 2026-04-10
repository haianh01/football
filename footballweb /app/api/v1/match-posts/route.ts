import { MatchPostStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiCreated, apiError, apiOk } from "@/lib/http";
import { createMatchPost, listMatchPosts, parseCreateMatchPostInput } from "@/features/matchmaking";

const MATCH_POST_STATUSES = new Set<MatchPostStatus>(["open", "pending_confirmation", "matched", "cancelled", "expired"]);
const FIELD_TYPES = new Set(["five", "seven", "eleven"] as const);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fieldType = searchParams.get("field_type");

    const data = await listMatchPosts({
      q: searchParams.get("q") ?? undefined,
      city_code: searchParams.get("city_code") ?? undefined,
      status: status && MATCH_POST_STATUSES.has(status as MatchPostStatus) ? (status as MatchPostStatus) : undefined,
      field_type: fieldType && FIELD_TYPES.has(fieldType as "five" | "seven" | "eleven") ? (fieldType as "five" | "seven" | "eleven") : undefined
    });

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentUser();
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseCreateMatchPostInput(body);
    const data = await createMatchPost(input, currentUser.id);

    return apiCreated(data);
  } catch (error) {
    return apiError(error);
  }
}
