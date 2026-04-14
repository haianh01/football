"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ApiFailure, ApiSuccess } from "./types";

type AcceptInviteResponse = ApiSuccess<{
  team_id: string;
}>;

function readApiErrorMessage(payload: ApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function TeamJoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/team-invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          invite_code: inviteCode
        })
      });

      const payload = (await response.json().catch(() => null)) as AcceptInviteResponse | ApiFailure | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as ApiFailure | null, "Không thể xử lý mã mời."));
        return;
      }

      router.push(`/team/${payload.data.team_id}`);
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
        Mã mời
        <input
          required
          name="invite_code"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          placeholder="VPINV-XXXXXXXXXX"
          disabled={isSubmitting}
          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang join..." : "Join ngay"}
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
        >
          Về trang chính
        </Link>
      </div>
    </form>
  );
}
