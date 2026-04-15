"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TeamFeeApiFailure, TeamFeeApiSuccess, TeamFeeSummary } from "@/features/team-finance";

import type { MatchInvitationApiFailure, MatchInvitationApiSuccess, MatchInvitationSummary } from "./types";

type TeamOption = {
  id: string;
  name: string;
  short_code: string;
};

type FeeDraft = {
  title: string;
  amount_per_member_minor: string;
  due_at: string;
};

type TargetTeamRole = "captain" | "vice_captain" | "treasurer" | "member" | null;

function readApiErrorMessage(
  payload: MatchInvitationApiFailure | TeamFeeApiFailure | null,
  fallback: string
) {
  return payload?.error?.message || fallback;
}

function formatMoney(amountMinor: number, currencyCode: string) {
  return `${amountMinor.toLocaleString("vi-VN")} ${currencyCode}`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function toLocalDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function buildDefaultFeeDraft(invitation: MatchInvitationSummary): FeeDraft {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 2);
  dueAt.setHours(21, 0, 0, 0);

  return {
    title: invitation.match_post.title ? `Tiền sân ${invitation.match_post.title}` : "Tiền sân kèo đã chốt",
    amount_per_member_minor: "50000",
    due_at: toLocalDateTimeInputValue(dueAt)
  };
}

function getPaymentTone(status: TeamFeeSummary["assignees"][number]["payment_status"]) {
  if (status === "paid") {
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }

  if (status === "overdue") {
    return "text-rose-700 bg-rose-50 border-rose-200";
  }

  if (status === "waived") {
    return "text-slate-700 bg-slate-100 border-slate-200";
  }

  if (status === "partially_paid") {
    return "text-amber-700 bg-amber-50 border-amber-200";
  }

  return "text-amber-700 bg-amber-50 border-amber-200";
}

function formatRoleLabel(role: TargetTeamRole) {
  switch (role) {
    case "captain":
      return "captain";
    case "treasurer":
      return "treasurer";
    case "vice_captain":
      return "vice captain";
    case "member":
      return "member";
    default:
      return "khách";
  }
}

function getFinanceConditionTone(passed: boolean) {
  return passed
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function getFinanceReadiness(
  invitation: MatchInvitationSummary,
  canManageFinance: boolean,
  targetTeamRole: TargetTeamRole,
  isTargetCaptain: boolean
) {
  const conditions = [
    {
      label: "Lời mời đã được chấp nhận",
      passed: invitation.status === "accepted"
    },
    {
      label: "Có ít nhất 1 người vote",
      passed: invitation.voters.length > 0
    },
    {
      label: "Bạn đang là thành viên của đội đăng kèo",
      passed: canManageFinance
    }
  ];

  const missingSteps: string[] = [];

  if (invitation.status !== "accepted") {
    missingSteps.push(isTargetCaptain ? "chấp nhận lời mời này" : "đợi captain chấp nhận lời mời này");
  }

  if (invitation.voters.length === 0) {
    missingSteps.push("có ít nhất 1 thành viên vote");
  }

  if (!canManageFinance) {
    missingSteps.push(
      targetTeamRole
        ? `dùng tài khoản thuộc đội đăng kèo thay vì ${formatRoleLabel(targetTeamRole)}`
        : "dùng tài khoản thành viên của đội đăng kèo"
    );
  }

  return {
    conditions,
    is_ready: conditions.every((condition) => condition.passed),
    summary:
      missingSteps.length === 0
        ? "Đã đủ điều kiện để tạo khoản thu."
        : `Để hiện nút tạo khoản thu, cần ${missingSteps.join(", ")}.`
  };
}

export function MatchInvitationPanel({
  matchPostId,
  matchPostStatus,
  targetTeamId,
  initialInvitations,
  eligibleInviterTeams,
  isTargetCaptain,
  isTargetMember,
  canManageFinance,
  targetTeamRole
}: {
  matchPostId: string;
  matchPostStatus: "open" | "pending_confirmation" | "matched" | "cancelled" | "expired";
  targetTeamId: string;
  initialInvitations: MatchInvitationSummary[];
  eligibleInviterTeams: TeamOption[];
  isTargetCaptain: boolean;
  isTargetMember: boolean;
  canManageFinance: boolean;
  targetTeamRole: TargetTeamRole;
}) {
  const router = useRouter();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [selectedTeamId, setSelectedTeamId] = useState(eligibleInviterTeams[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [pendingFinanceKey, setPendingFinanceKey] = useState<string | null>(null);
  const [feeDrafts, setFeeDrafts] = useState<Record<string, FeeDraft>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eligibleTeamIds = new Set(eligibleInviterTeams.map((team) => team.id));
  const incomingInvitations = invitations.filter((invitation) => invitation.target_team.id === targetTeamId);
  const outgoingInvitations = invitations.filter((invitation) => eligibleTeamIds.has(invitation.inviter_team.id));
  const canCreateInvitation =
    eligibleInviterTeams.length > 0 && ["open", "pending_confirmation"].includes(matchPostStatus);

  function getFeeDraft(invitation: MatchInvitationSummary) {
    return feeDrafts[invitation.id] ?? buildDefaultFeeDraft(invitation);
  }

  function updateFeeDraft(invitationId: string, patch: Partial<FeeDraft>) {
    setFeeDrafts((currentDrafts) => ({
      ...currentDrafts,
      [invitationId]: {
        ...(currentDrafts[invitationId] ?? buildDefaultFeeDraft(incomingInvitations.find((item) => item.id === invitationId)!)),
        ...patch
      }
    }));
  }

  function updateInvitationById(invitationId: string, updater: (invitation: MatchInvitationSummary) => MatchInvitationSummary) {
    setInvitations((currentInvitations) =>
      currentInvitations.map((invitation) => (invitation.id === invitationId ? updater(invitation) : invitation))
    );
  }

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

  async function toggleVote(invitation: MatchInvitationSummary) {
    if (pendingInvitationId) return;
    setPendingInvitationId(invitation.id);
    setErrorMessage(null);

    const action = invitation.has_voted_by_current_user ? "DELETE" : "POST";

    updateInvitationById(invitation.id, (currentInvitation) => ({
      ...currentInvitation,
      has_voted_by_current_user: !currentInvitation.has_voted_by_current_user,
      vote_count: currentInvitation.vote_count + (currentInvitation.has_voted_by_current_user ? -1 : 1)
    }));

    try {
      const response = await fetch(`/api/v1/match-invitations/${invitation.id}/vote`, {
        method: action
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<MatchInvitationSummary>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        throw new Error(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể cập nhật bình chọn."));
      }

      updateInvitationById(invitation.id, () => payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
      updateInvitationById(invitation.id, () => invitation);
    } finally {
      setPendingInvitationId(null);
    }
  }

  async function createFee(invitation: MatchInvitationSummary) {
    const draft = getFeeDraft(invitation);
    setPendingFinanceKey(`create:${invitation.id}`);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/match-invitations/${invitation.id}/fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: draft.title || undefined,
          amount_per_member_minor: Number(draft.amount_per_member_minor),
          due_at: new Date(draft.due_at).toISOString()
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | TeamFeeApiSuccess<TeamFeeSummary>
        | TeamFeeApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as TeamFeeApiFailure | null, "Không thể tạo khoản thu."));
        return;
      }

      updateInvitationById(invitation.id, (currentInvitation) => ({
        ...currentInvitation,
        fee: payload.data
      }));
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingFinanceKey(null);
    }
  }

  async function updatePaymentStatus(
    invitationId: string,
    feeId: string,
    assigneeId: string,
    paymentStatus: "pending" | "paid"
  ) {
    setPendingFinanceKey(`assignee:${assigneeId}:${paymentStatus}`);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/team-fees/${feeId}/assignees/${assigneeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payment_status: paymentStatus
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | TeamFeeApiSuccess<TeamFeeSummary>
        | TeamFeeApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as TeamFeeApiFailure | null, "Không thể cập nhật trạng thái thu tiền."));
        return;
      }

      updateInvitationById(invitationId, (currentInvitation) => ({
        ...currentInvitation,
        fee: payload.data
      }));
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingFinanceKey(null);
    }
  }

  return (
    <section id="team-finance" className="mt-6 surface-card rounded-[2rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Match Invitation</p>
      <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
        Chốt kèo
      </h2>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {!isTargetMember ? (
        <div className="mt-4 rounded-3xl border border-dashed border-amber-300 bg-amber-50/70 p-4 text-sm text-amber-800">
          Bạn đang xem ở phía đội gửi lời mời hoặc bằng tài khoản không thuộc đội đăng kèo. Vote và kế toán chỉ hiện cho thành viên của đội đăng kèo.
        </div>
      ) : null}

      {isTargetMember ? (
        <div className="mt-4 rounded-3xl border border-black/10 bg-[var(--card-muted)] p-4 text-sm text-[var(--ink-soft)]">
          <p className="font-semibold text-[var(--brand-strong)]">Điều kiện để hiện nút tạo khoản thu</p>
          <p className="mt-1">
            Nút này chỉ hiện trên card lời mời đã <strong>accepted</strong>, có ít nhất <strong>1 vote</strong>, và bạn đang là{" "}
            <strong>thành viên đội đăng kèo</strong>.
          </p>
          {!canManageFinance ? (
            <p className="mt-2 text-amber-700">
              Tài khoản hiện tại của bạn là <strong>{formatRoleLabel(targetTeamRole)}</strong>, nên chỉ xem được tiến độ chứ không tạo khoản thu được.
            </p>
          ) : null}
        </div>
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

      {isTargetMember ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[var(--brand-strong)]">Lời mời cho kèo này</p>
          <div className="mt-3 grid gap-3">
            {incomingInvitations.length === 0 ? (
              <p className="rounded-2xl bg-[var(--card-muted)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                Chưa có lời mời nào cho kèo này.
              </p>
            ) : (
              incomingInvitations.map((invitation) => {
                const feeDraft = getFeeDraft(invitation);
                const fee = invitation.fee;
                const financeReadiness = getFinanceReadiness(invitation, canManageFinance, targetTeamRole, isTargetCaptain);

                return (
                  <article key={invitation.id} className="rounded-2xl bg-[var(--card-muted)] p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{invitation.status}</p>
                        <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                          {invitation.inviter_team.name} muốn chốt kèo
                        </p>
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">{invitation.inviter_team.short_code}</p>
                        {invitation.note ? <p className="mt-3 text-sm text-[var(--ink-soft)]">{invitation.note}</p> : null}
                        {isTargetCaptain && invitation.status === "pending" ? (
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
                      </div>

                      {invitation.status === "pending" ? (
                        <div className="flex flex-col items-center justify-start gap-1">
                          <button
                            type="button"
                            onClick={() => void toggleVote(invitation)}
                            disabled={pendingInvitationId === invitation.id}
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl transition disabled:opacity-50 ${
                              invitation.has_voted_by_current_user
                                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                : "border-black/5 bg-white text-gray-400 hover:border-red-200 hover:text-red-400"
                            }`}
                          >
                            {invitation.has_voted_by_current_user ? "♥️" : "♡"}
                          </button>
                          {invitation.vote_count > 0 ? (
                            <p className="text-xs font-semibold text-red-500">{invitation.vote_count} votes</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {invitation.voters.length > 0 ? (
                      <div className="mt-4 rounded-2xl bg-white/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Đã vote</p>
                          <p className="text-xs text-[var(--ink-soft)]">{invitation.voters.length} người</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {invitation.voters.map((voter) => (
                            <span
                              key={voter.user_id}
                              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[var(--brand-strong)]"
                            >
                              {voter.display_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Kế toán</p>
                          <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                            {fee ? fee.title : "Tạo khoản thu từ người đã vote"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--ink-soft)]">
                            {fee
                              ? `Tổng thu ${formatMoney(fee.total_amount_minor, fee.currency_code)} • Hạn ${formatDateTime(fee.due_at)}`
                              : "Hệ thống sẽ kiểm tra đủ điều kiện rồi mới hiện nút tạo khoản thu."}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            fee
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : financeReadiness.is_ready
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {fee ? "Đã tạo khoản thu" : financeReadiness.is_ready ? "Sẵn sàng tạo khoản thu" : "Chưa đủ điều kiện"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {financeReadiness.conditions.map((condition) => (
                          <div
                            key={condition.label}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${getFinanceConditionTone(condition.passed)}`}
                          >
                            <p className="text-xs uppercase tracking-[0.2em] opacity-80">{condition.passed ? "Đã đạt" : "Còn thiếu"}</p>
                            <p className="mt-1">{condition.label}</p>
                          </div>
                        ))}
                      </div>

                      {fee ? (
                        <>
                          <p className="mt-4 text-xs text-[var(--ink-soft)]">
                            {fee.paid_count}/{fee.assignee_count} người đã đóng • {fee.overdue_count} quá hạn
                          </p>

                          <div className="mt-4 grid gap-2">
                            {fee.assignees.map((assignee) => (
                              <div
                                key={assignee.id}
                                className="rounded-2xl border border-black/10 bg-white px-4 py-3"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-[var(--brand-strong)]">{assignee.display_name}</p>
                                    <p className="mt-1 text-xs text-[var(--ink-soft)]">
                                      Phải đóng {formatMoney(assignee.amount_due_minor, fee.currency_code)}
                                      {assignee.paid_at ? ` • xác nhận ${formatDateTime(assignee.paid_at)}` : ""}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentTone(
                                        assignee.payment_status
                                      )}`}
                                    >
                                      {assignee.payment_status}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => void updatePaymentStatus(invitation.id, fee.id, assignee.id, "paid")}
                                      disabled={
                                        assignee.payment_status === "paid" ||
                                        pendingFinanceKey === `assignee:${assignee.id}:paid`
                                      }
                                      className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                      {pendingFinanceKey === `assignee:${assignee.id}:paid` ? "Đang lưu..." : "Đã đóng"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void updatePaymentStatus(invitation.id, fee.id, assignee.id, "pending")}
                                      disabled={
                                        assignee.payment_status !== "paid" ||
                                        pendingFinanceKey === `assignee:${assignee.id}:pending`
                                      }
                                      className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                      {pendingFinanceKey === `assignee:${assignee.id}:pending` ? "Đang lưu..." : "Chưa đóng"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : financeReadiness.is_ready ? (
                        <>
                          <p className="mt-4 text-sm text-[var(--ink-soft)]">
                            Tạo khoản thu từ {invitation.voters.length} người đã vote, rồi đánh dấu ai đã đóng tiền.
                          </p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input
                              value={feeDraft.title}
                              onChange={(event) => updateFeeDraft(invitation.id, { title: event.target.value })}
                              placeholder="Tên khoản thu"
                              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
                            />
                            <input
                              type="number"
                              min="0"
                              value={feeDraft.amount_per_member_minor}
                              onChange={(event) =>
                                updateFeeDraft(invitation.id, { amount_per_member_minor: event.target.value })
                              }
                              placeholder="Số tiền mỗi người"
                              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
                            />
                            <input
                              type="datetime-local"
                              value={feeDraft.due_at}
                              onChange={(event) => updateFeeDraft(invitation.id, { due_at: event.target.value })}
                              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)] sm:col-span-2"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => void createFee(invitation)}
                            disabled={pendingFinanceKey === `create:${invitation.id}`}
                            className="mt-4 rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {pendingFinanceKey === `create:${invitation.id}`
                              ? "Đang tạo khoản thu..."
                              : "Tạo khoản thu từ người đã vote"}
                          </button>
                        </>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--ink-soft)]">{financeReadiness.summary}</p>
                      )}
                    </div>
                  </article>
                );
              })
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
