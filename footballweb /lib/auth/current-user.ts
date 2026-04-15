import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ApiError } from "@/lib/http";
import { db } from "@/lib/db";
import { ensureUserByEmail } from "@/lib/auth/user-provisioning";

const DEFAULT_DEV_EMAIL = "captain@vpitch.local";
const DEFAULT_DEV_NAME = "V-Pitch Captain";

async function getDevelopmentUser() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const requestHeaders = await headers();
  const demoUserId = requestHeaders.get("x-demo-user-id");
  const headerDemoEmail = requestHeaders.get("x-demo-user-email");
  const explicitDemoEmail = headerDemoEmail ?? process.env.DEV_AUTH_BYPASS_EMAIL ?? null;
  const demoUserName =
    requestHeaders.get("x-demo-user-name") ?? process.env.DEV_USER_NAME ?? DEFAULT_DEV_NAME;

  if (!demoUserId && !explicitDemoEmail) {
    return null;
  }

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

  return ensureUserByEmail(explicitDemoEmail ?? DEFAULT_DEV_EMAIL, demoUserName);
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

export async function requirePageUser(redirectTo = "/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo as never);
  }

  return user;
}
