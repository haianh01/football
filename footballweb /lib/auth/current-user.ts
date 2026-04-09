import { headers } from "next/headers";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";

const DEFAULT_DEV_EMAIL = "captain@vpitch.local";
const DEFAULT_DEV_NAME = "V-Pitch Captain";

async function ensureDevUserByEmail(email: string, displayName: string) {
  const user = await db.user.upsert({
    where: {
      email
    },
    update: {},
    create: {
      email,
      display_name: displayName,
      preferred_locale: "vi-VN",
      timezone: "Asia/Ho_Chi_Minh",
      country_code: "VN"
    }
  });

  await db.userPreference.upsert({
    where: {
      user_id: user.id
    },
    update: {},
    create: {
      user_id: user.id
    }
  });

  return user;
}

async function getDevelopmentUser() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const requestHeaders = await headers();
  const demoUserId = requestHeaders.get("x-demo-user-id");
  const demoUserEmail =
    requestHeaders.get("x-demo-user-email") ?? process.env.DEV_USER_EMAIL ?? DEFAULT_DEV_EMAIL;
  const demoUserName = process.env.DEV_USER_NAME ?? DEFAULT_DEV_NAME;

  if (demoUserId) {
    const existingUser = await db.user.findUnique({
      where: {
        id: demoUserId
      }
    });

    if (existingUser) {
      return existingUser;
    }
  }

  return ensureDevUserByEmail(demoUserEmail, demoUserName);
}

export async function getCurrentUser() {
  let sessionUser: { id?: string; email?: string | null } | undefined;

  try {
    const session = await auth();
    sessionUser = session?.user as { id?: string; email?: string | null } | undefined;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }

  if (sessionUser?.id) {
    const user = await db.user.findUnique({
      where: {
        id: sessionUser.id
      }
    });

    if (user) {
      return user;
    }
  }

  if (sessionUser?.email) {
    const user = await db.user.findUnique({
      where: {
        email: sessionUser.email
      }
    });

    if (user) {
      return user;
    }
  }

  return getDevelopmentUser();
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  return user;
}
