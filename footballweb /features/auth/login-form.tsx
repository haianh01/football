"use client";

import { useActionState } from "react";

import { loginAction } from "./actions";

export function LoginForm({
  redirectTo
}: {
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
        Email
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
        Tên hiển thị
        <input
          type="text"
          name="display_name"
          placeholder="Ví dụ: Hải Anh"
          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
