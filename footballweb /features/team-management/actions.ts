"use server";

import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { ApiError } from "@/lib/http";

import { createTeam, parseCreateTeamInput } from "./service";

const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024;

// Temporary strategy for the pre-user phase:
// keep team creation self-contained by storing uploaded logos as data URLs.
// Replace this with signed upload + persistent file URL when object storage is introduced.
async function resolveLogoValue(formData: FormData, currentLogoUrl?: string) {
  const fileValue = formData.get("logo_file");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return currentLogoUrl;
  }

  if (!fileValue.type.startsWith("image/")) {
    throw new ApiError(400, "VALIDATION_ERROR", "Logo file must be an image.");
  }

  if (fileValue.size > MAX_LOGO_FILE_SIZE) {
    throw new ApiError(400, "VALIDATION_ERROR", "Logo file must be 2MB or smaller.");
  }

  const buffer = Buffer.from(await fileValue.arrayBuffer());
  const base64 = buffer.toString("base64");

  return `data:${fileValue.type};base64,${base64}`;
}

export async function createTeamAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const input = parseCreateTeamInput(formData);
  input.logo_url = await resolveLogoValue(formData, input.logo_url);
  const team = await createTeam(input, currentUser.id);

  redirect(`/team/${team.id}`);
}
