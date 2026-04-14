"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { MatchInvitationApiFailure, MatchInvitationApiSuccess, MatchInvitationSummary } from "./types";

type TeamOption = {
  id: string;
  name: string;
  short_code: string;
};

function readApiErrorMessage(payload: MatchInvitationApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function MatchInvitationPanel({
  matchPostId,
  matchPostStatus,
  targetTeamId,
  initialInvitations,
  eligibleInviterTeams,
  isTargetCaptain
}: {
  matchPostId: string;
  matchPostStatus: "open" | "pending_confirmation" | "matched" | "cancelled" | "expired";
  targetTeamId: string;
  initialInvitations: MatchInvitationSummary[];
  eligibleInviterTeams: TeamOption[];
  isTargetCaptain: boolean;
}) {
  const router = useRouter();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [selectedTeamId, setSelectedTeamId] = useState(eligibleInviterTeams[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eligibleTeamIds = new Set(eligibleInviterTeams.map((team) => team.id));
  const incomingInvitations = invitations.filter((invitation) => invitation.target_team.id === targetTeamId);
  const outgoingInvitations = invitations.filter((invitation) => eligibleTeamIds.has(invitation.inviter_team.id));
  const canCreateInvitation =
    eligibleInviterTeams.length > 0 && [ "open", "pending_confirmation" ].includes(matchPostStatus);

  async function createInvitation() {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/match-posts/${matchPostId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inviter_team_id: selectedTeamId,
          note: note || undefined
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<MatchInvitationSummary>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể gửi lời mời."));
        return;
      }

      setInvitations((currentInvitations) => [payload.data, ...currentInvitations]);
      setNote("");
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  }

  async function mutateInvitation(invitationId: string, action: "accept" | "reject" | "cancel") {
    setPendingInvitationId(invitationId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/match-invitations/${invitationId}/${action}`, {
        method: "POST"
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<MatchInvitationSummary>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể cập nhật lời mời."));
        return;
      }

      setInvitations((currentInvitations) =>
        currentInvitations.map((invitation) => {
          if (invitation.id === invitationId) {
            return payload.data;
          }

          if (action === "accept" && invitation.match_post.id === payload.data.match_post.id && invitation.status === "pending") {
            return {
              ...invitation,
              status: "cancelled",
              responded_at: new Date().toISOString()
            };
          }

          return invitation;
        })
      );

      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingInvitationId(null);
    }
  }

  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Match Invitation</p>
      <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
        Chốt kèo
      </h2>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {canCreateInvitation ? (
        <div className="mt-5 rounded-3xl bg-[var(--card-muted)] p-5">
          <p className="text-sm font-semibold text-[var(--brand-strong)]">Gửi lời mời từ đội của bạn</p>
          {eligibleInviterTeams.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Bạn cần là captain của một đội khác để gửi lời mời chốt kèo.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                disabled={isCreating}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              >
                {eligibleInviterTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.short_code})
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ghi chú ngắn cho đội đăng kèo..."
                disabled={isCreating}
                className="rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => void createInvitation()}
                disabled={isCreating || !selectedTeamId}
                className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreating ? "Đang gửi..." : "Gửi lời mời chốt kèo"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {isTargetCaptain ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--brand-strong)]">Lời mời đang chờ phản hồi</p>
          <div className="mt-3 grid gap-3">
            {incomingInvitations.length === 0 ? (
              <p className="rounded-2xl bg-[var(--card-muted)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                Chưa có lời mời nào cho kèo này.
              </p>
            ) : (
              incomingInvitations.map((invitation) => (
                <article key={invitation.id} className="rounded-2xl bg-[var(--card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{invitation.status}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                    {invitation.inviter_team.name} muốn chốt kèo
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{invitation.inviter_team.short_code}</p>
                  {invitation.note ? <p className="mt-3 text-sm text-[var(--ink-soft)]">{invitation.note}</p> : null}
                  {invitation.status === "pending" ? (
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
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}

      {outgoingInvitations.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--brand-strong)]">Lời mời bạn đã gửi</p>
          <div className="mt-3 grid gap-3">
            {outgoingInvitations.map((invitation) => (
              <article key={invitation.id} className="rounded-2xl bg-[var(--card-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{invitation.status}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {invitation.inviter_team.name} to {invitation.target_team.name}
                </p>
                {invitation.note ? <p className="mt-3 text-sm text-[var(--ink-soft)]">{invitation.note}</p> : null}
                {invitation.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => void mutateInvitation(invitation.id, "cancel")}
                    disabled={pendingInvitationId === invitation.id}
                    className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pendingInvitationId === invitation.id ? "Đang xử lý..." : "Hủy lời mời"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
