"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { MatchInvitationApiFailure, MatchInvitationApiSuccess, MatchInvitationDashboardItem } from "./types";

function readApiErrorMessage(payload: MatchInvitationApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function TeamMatchInvitationInbox({
  initialInvitations
}: {
  initialInvitations: MatchInvitationDashboardItem[];
}) {
  const router = useRouter();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function mutateInvitation(invitationId: string, action: "accept" | "reject") {
    setPendingInvitationId(invitationId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/match-invitations/${invitationId}/${action}`, {
        method: "POST"
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<{ id: string }>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok) {
        setErrorMessage(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể cập nhật lời mời."));
        return;
      }

      setInvitations((currentInvitations) => currentInvitations.filter((invitation) => invitation.id !== invitationId));
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingInvitationId(null);
    }
  }

  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Match Invitations</p>
          <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            Chờ xác nhận
          </h2>
        </div>
        <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {invitations.length} pending
        </span>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {invitations.length === 0 ? (
          <p className="rounded-2xl bg-[var(--card-muted)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            Hiện chưa có lời mời nào cần xử lý.
          </p>
        ) : (
          invitations.map((invitation) => (
            <article key={invitation.id} className="rounded-2xl bg-[var(--card-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{invitation.status}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                {invitation.inviter_team.name} gửi lời mời cho {invitation.match_post.title || "kèo giao lưu"}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                {invitation.match_post.date} • {invitation.match_post.start_time}
                {invitation.match_post.venue_name ? ` • ${invitation.match_post.venue_name}` : ""}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void mutateInvitation(invitation.id, "accept")}
                  disabled={pendingInvitationId === invitation.id}
                  className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pendingInvitationId === invitation.id ? "Đang xử lý..." : "Chấp nhận"}
                </button>
                <button
                  type="button"
                  onClick={() => void mutateInvitation(invitation.id, "reject")}
                  disabled={pendingInvitationId === invitation.id}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Từ chối
                </button>
                <Link
                  href={`/match/posts/${invitation.match_post.id}`}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
                >
                  Xem kèo
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
