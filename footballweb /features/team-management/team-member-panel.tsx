"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ApiFailure, ApiSuccess, TeamDashboardMember } from "./types";

const roleOptions = [
  { value: "captain", label: "Captain" },
  { value: "vice_captain", label: "Vice Captain" },
  { value: "treasurer", label: "Treasurer" },
  { value: "member", label: "Member" }
] as const;

const roleLabels = {
  captain: "Captain",
  vice_captain: "Vice Captain",
  treasurer: "Treasurer",
  member: "Member"
} as const;

const statusLabels = {
  active: "Active",
  invited: "Invited",
  pending_approval: "Pending approval",
  inactive: "Inactive",
  removed: "Removed"
} as const;

type TeamMemberUpdateResponse = ApiSuccess<TeamDashboardMember>;

function readApiErrorMessage(payload: ApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function TeamMemberPanel({
  teamId,
  currentUserId,
  currentUserRole,
  initialMembers
}: {
  teamId: string;
  currentUserId: string;
  currentUserRole: "captain" | "vice_captain" | "treasurer" | "member" | null;
  initialMembers: TeamDashboardMember[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canManageMembers = currentUserRole === "captain";
  const showActionsColumn = canManageMembers || members.some((member) => member.user_id === currentUserId && member.status === "active");
  const gridClass = showActionsColumn
    ? "grid grid-cols-[1.35fr_0.85fr_0.8fr_0.8fr_1fr] gap-3"
    : "grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-3";

  async function mutateMember(
    memberId: string,
    payload: {
      role?: TeamDashboardMember["role"];
      status?: "active" | "inactive" | "removed";
    }
  ) {
    setPendingMemberId(memberId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/teams/${teamId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const apiPayload = (await response.json().catch(() => null)) as TeamMemberUpdateResponse | ApiFailure | null;

      if (!response.ok || !apiPayload || !("data" in apiPayload)) {
        setErrorMessage(readApiErrorMessage(apiPayload as ApiFailure | null, "Không thể cập nhật thành viên."));
        return;
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) => (member.id === memberId ? apiPayload.data : member))
      );

      if (apiPayload.data.user_id === currentUserId && apiPayload.data.status !== "active") {
        router.push("/");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingMemberId(null);
    }
  }

  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Members</p>
          <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">Danh sách thành viên</h2>
        </div>
        <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {members.length} records
        </span>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-3xl border border-black/8 bg-white">
        <div className={`${gridClass} border-b border-black/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]`}>
          <span>Thành viên</span>
          <span>Role</span>
          <span>Attendance</span>
          <span>Công nợ</span>
          {showActionsColumn ? <span>Actions</span> : null}
        </div>

        {members.map((member) => {
          const isSelf = member.user_id === currentUserId;
          const isMutating = pendingMemberId === member.id;
          const canUpdateRole = canManageMembers && !isSelf && member.status === "active";
          const canRemoveMember = canManageMembers && !isSelf && member.status === "active";
          const canReactivateMember = canManageMembers && !isSelf && member.status !== "active";
          const canLeaveTeam = isSelf && member.status === "active";

          return (
            <div key={member.id} className={`${gridClass} border-b border-black/6 px-4 py-4 text-sm last:border-b-0`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--brand-strong)]">{member.display_name}</p>
                  {isSelf ? (
                    <span className="rounded-full bg-[var(--card-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--brand)]">Bạn</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{statusLabels[member.status]}</p>
              </div>

              <div className="flex items-center">
                {canUpdateRole ? (
                  <select
                    value={member.role}
                    disabled={isMutating}
                    onChange={(event) => void mutateMember(member.id, { role: event.target.value as TeamDashboardMember["role"] })}
                    className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-semibold uppercase text-[var(--brand)]">{roleLabels[member.role]}</span>
                )}
              </div>

              <span className="flex items-center font-medium text-[var(--brand-strong)]">{member.attendance_rate}%</span>

              <span className="flex items-center font-medium text-[var(--brand-strong)]">
                {member.current_debt_amount_minor.toLocaleString("vi-VN")} {member.currency_code}
              </span>

              {showActionsColumn ? (
                <div className="flex flex-wrap items-center gap-2">
                  {canRemoveMember ? (
                    <button
                      type="button"
                      onClick={() => void mutateMember(member.id, { status: "removed" })}
                      disabled={isMutating}
                      className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-white/70 disabled:opacity-70"
                    >
                      {isMutating ? "Đang xử lý..." : "Xóa khỏi đội"}
                    </button>
                  ) : null}

                  {canReactivateMember ? (
                    <button
                      type="button"
                      onClick={() => void mutateMember(member.id, { status: "active" })}
                      disabled={isMutating}
                      className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-white/70 disabled:opacity-70"
                    >
                      {isMutating ? "Đang xử lý..." : "Kích hoạt lại"}
                    </button>
                  ) : null}

                  {canLeaveTeam ? (
                    <button
                      type="button"
                      onClick={() => void mutateMember(member.id, { status: "inactive" })}
                      disabled={isMutating}
                      className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-strong)] transition hover:bg-white/70 disabled:opacity-70"
                    >
                      {isMutating ? "Đang xử lý..." : "Rời đội"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
