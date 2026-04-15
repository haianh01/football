"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type LoginActionState = {
  error: string | null;
};

const INITIAL_STATE: LoginActionState = {
  error: null
};

export async function loginAction(_previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).trim() : "";
  const displayName = typeof formData.get("display_name") === "string" ? String(formData.get("display_name")).trim() : "";
  const redirectTo = typeof formData.get("redirect_to") === "string" ? String(formData.get("redirect_to")) : "/";

  if (!email) {
    return {
      error: "Email là bắt buộc."
    };
  }

  try {
    await signIn("credentials", {
      email,
      display_name: displayName,
      redirectTo: redirectTo || "/"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: error.type === "CredentialsSignin" ? "Không thể đăng nhập với email này." : "Đăng nhập thất bại."
      };
    }

    throw error;
  }

  return INITIAL_STATE;
}

export async function googleLoginAction(formData: FormData) {
  const redirectTo = typeof formData.get("redirect_to") === "string" ? String(formData.get("redirect_to")) : "/";

  await signIn("google", {
    redirectTo: redirectTo || "/"
  });
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/"
  });
}
