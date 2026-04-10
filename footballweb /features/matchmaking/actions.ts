"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";

import { createMatchPost, parseCreateMatchPostInput } from "./service";

export async function createMatchPostAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const input = parseCreateMatchPostInput(formData);
  const matchPost = await createMatchPost(input, currentUser.id);

  revalidatePath("/match/posts");
  revalidatePath(`/match/posts/${matchPost.id}`);
  revalidatePath(`/team/${input.team_id}`);

  redirect(`/match/posts/${matchPost.id}`);
}
