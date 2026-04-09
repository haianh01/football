import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk } from "@/lib/http";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();
    const preferences = await db.userPreference.findUnique({
      where: {
        user_id: currentUser.id
      }
    });

    return apiOk({
      id: currentUser.id,
      display_name: currentUser.display_name,
      avatar_url: currentUser.avatar_url,
      preferred_locale: currentUser.preferred_locale,
      timezone: currentUser.timezone,
      spoken_languages: Array.isArray(preferences?.spoken_languages) ? preferences.spoken_languages : []
    });
  } catch (error) {
    return apiError(error);
  }
}

