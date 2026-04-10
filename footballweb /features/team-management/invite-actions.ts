"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";

import { acceptTeamInvite, createTeamInvite, revokeTeamInvite } from "./service";

export async function createTeamInviteAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const teamId = String(formData.get("team_id") ?? "");

  if (!teamId) {
    redirect("/");
  }

  await createTeamInvite(teamId, currentUser.id);
  revalidatePath(`/team/${teamId}`);
  redirect(`/team/${teamId}`);
}

export async function revokeTeamInviteAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const teamId = String(formData.get("team_id") ?? "");
  const inviteId = String(formData.get("invite_id") ?? "");

  if (!teamId || !inviteId) {
    redirect("/");
  }

  await revokeTeamInvite(teamId, inviteId, currentUser.id);
  revalidatePath(`/team/${teamId}`);
  redirect(`/team/${teamId}`);
}

export async function acceptTeamInviteAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const inviteCode = String(formData.get("invite_code") ?? "");

  const { team_id } = await acceptTeamInvite(inviteCode, currentUser.id);
  revalidatePath(`/team/${team_id}`);
  redirect(`/team/${team_id}`);
}

