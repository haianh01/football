import { IdentityProvider } from "@prisma/client";

import { db } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function deriveDisplayName(email: string) {
  const localPart = normalizeEmail(email).split("@")[0] || "player";

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export async function ensureUserByEmail(
  email: string,
  displayName?: string | null,
  options: {
    provider?: IdentityProvider;
    providerSubject?: string | null;
  } = {}
) {
  const normalizedEmail = normalizeEmail(email);
  const nextDisplayName = displayName?.trim() || deriveDisplayName(normalizedEmail);
  const provider = options.provider ?? IdentityProvider.email;
  const providerSubject = options.providerSubject?.trim() || normalizedEmail;

  const user = await db.user.upsert({
    where: {
      email: normalizedEmail
    },
    update: {
      display_name: nextDisplayName
    },
    create: {
      email: normalizedEmail,
      display_name: nextDisplayName,
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

  await db.userIdentity.upsert({
    where: {
      provider_provider_subject: {
        provider,
        provider_subject: providerSubject
      }
    },
    update: {
      user_id: user.id
    },
    create: {
      user_id: user.id,
      provider,
      provider_subject: providerSubject
    }
  });

  return user;
}
