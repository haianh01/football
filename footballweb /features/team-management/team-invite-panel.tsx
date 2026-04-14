"use client";

import { useState } from "react";
import Link from "next/link";

import type { ApiFailure, ApiSuccess, TeamInviteSummary } from "./types";

type CreateInviteResponse = ApiSuccess<{
  invite: TeamInviteSummary;
}>;

type RevokeInviteResponse = ApiSuccess<{
  team_id: string;
  invite_id: string;
  revoked: boolean;
}>;

function readApiErrorMessage(payload: ApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function TeamInvitePanel({
  teamId,
  initialInvites
}: {
  teamId: string;
  initialInvites: TeamInviteSummary[];
}) {
  const [invites, setInvites] = useState(initialInvites);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);

  async function createInvite() {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/teams/${teamId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      const payload = (await response.json().catch(() => null)) as CreateInviteResponse | ApiFailure | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as ApiFailure | null, "Không thể tạo mã mời."));
        return;
      }

      setInvites((currentInvites) => [payload.data.invite, ...currentInvites]);
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  }

  async function revokeInvite(inviteId: string) {
    setPendingInviteId(inviteId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/teams/${teamId}/invites/${inviteId}/revoke`, {
        method: "POST"
      });

      const payload = (await response.json().catch(() => null)) as RevokeInviteResponse | ApiFailure | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as ApiFailure | null, "Không thể thu hồi mã mời."));
        return;
      }

      setInvites((currentInvites) =>
        currentInvites.map((invite) => (invite.id === inviteId ? { ...invite, status: "revoked" } : invite))
      );
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingInviteId(null);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-black/8 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Team Invite</p>
      <h3 className="mt-2 font-[var(--font-headline)] text-xl font-extrabold text-[var(--brand-strong)]">Mời thành viên</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
        Tạo mã mời để thành viên khác join team. Slice này ưu tiên code-based invite.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={() => void createInvite()}
        disabled={isCreating}
        className="mt-4 w-full rounded-2xl bg-[var(--brand-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isCreating ? "Đang tạo..." : "Tạo mã mời"}
      </button>

      <div className="mt-5 grid gap-3">
        {invites.length === 0 ? (
          <p className="rounded-2xl bg-[var(--card-muted)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            Chưa có mã mời nào. Nhấn “Tạo mã mời” để tạo mới.
          </p>
        ) : (
          invites.map((invite) => (
            <article key={invite.id} className="rounded-2xl bg-[var(--card-muted)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{invite.status}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">Mã mời</p>
                  <input
                    readOnly
                    value={invite.invite_code}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[var(--brand-strong)]"
                    aria-label="Mã mời"
                  />
                  <p className="mt-2 text-xs text-[var(--ink-soft)]">
                    Hết hạn: {new Date(invite.expires_at).toLocaleString("vi-VN")}
                  </p>
                  <Link
                    href={`/team/join?code=${encodeURIComponent(invite.invite_code)}`}
                    className="mt-3 inline-flex rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
                  >
                    Mở link join
                  </Link>
                </div>

                {invite.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => void revokeInvite(invite.id)}
                    disabled={pendingInviteId === invite.id}
                    className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pendingInviteId === invite.id ? "Đang thu hồi..." : "Thu hồi"}
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
