"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { MatchInvitationApiFailure, MatchInvitationApiSuccess, MatchParticipantSummary } from "./types";

const attendanceLabels = {
  invited: "Đã mời",
  confirmed: "Đã xác nhận",
  declined: "Đã từ chối",
  checked_in: "Đã check-in",
  absent: "Vắng mặt"
} as const;

function readApiErrorMessage(payload: MatchInvitationApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function MatchParticipantPanel({
  matchId,
  currentUserId,
  initialParticipants,
  captainTeamIds,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName
}: {
  matchId: string;
  currentUserId: string;
  initialParticipants: MatchParticipantSummary[];
  captainTeamIds: string[];
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string;
  awayTeamName: string;
}) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [pendingParticipantId, setPendingParticipantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const groupedParticipants = useMemo(
    () => [
      {
        teamId: homeTeamId,
        teamName: homeTeamName,
        items: participants.filter((participant) => participant.team_id === homeTeamId)
      },
      {
        teamId: awayTeamId,
        teamName: awayTeamName,
        items: participants.filter((participant) => participant.team_id === awayTeamId)
      }
    ].filter((group) => group.teamId !== null),
    [awayTeamId, awayTeamName, homeTeamId, homeTeamName, participants]
  );

  async function updateAttendance(
    participantId: string,
    attendanceStatus: "confirmed" | "declined" | "checked_in" | "absent"
  ) {
    setPendingParticipantId(participantId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/matches/${matchId}/participants/${participantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attendance_status: attendanceStatus
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<MatchParticipantSummary>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể cập nhật xác nhận tham gia."));
        return;
      }

      setParticipants((currentParticipants) =>
        currentParticipants.map((participant) => (participant.id === participantId ? payload.data : participant))
      );
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setPendingParticipantId(null);
    }
  }

  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Participants</p>
      <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">Xác nhận tham gia</h2>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {groupedParticipants.map((group) => (
          <div key={group.teamId} className="rounded-3xl bg-[var(--card-muted)] p-5">
            <p className="text-sm font-semibold text-[var(--brand-strong)]">{group.teamName}</p>

            <div className="mt-4 grid gap-3">
              {group.items.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">Chưa có danh sách thành viên cho trận này.</p>
              ) : (
                group.items.map((participant) => {
                  const isCurrentUser = participant.user_id === currentUserId;
                  const isMutating = pendingParticipantId === participant.id;
                  const canCaptainManage = participant.team_id !== null && captainTeamIds.includes(participant.team_id);
                  const attendanceActions = canCaptainManage
                    ? [
                        {
                          status: "confirmed" as const,
                          label: isCurrentUser ? "Xác nhận tham gia" : "Xác nhận"
                        },
                        {
                          status: "declined" as const,
                          label: isCurrentUser ? "Không tham gia" : "Từ chối"
                        },
                        {
                          status: "checked_in" as const,
                          label: "Check-in"
                        },
                        {
                          status: "absent" as const,
                          label: "Vắng mặt"
                        }
                      ]
                    : isCurrentUser
                      ? [
                          {
                            status: "confirmed" as const,
                            label: "Xác nhận tham gia"
                          },
                          {
                            status: "declined" as const,
                            label: "Không tham gia"
                          }
                        ]
                      : [];

                  return (
                    <article key={participant.id} className="rounded-2xl bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--brand-strong)]">{participant.user.display_name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
                            {participant.role} • {attendanceLabels[participant.attendance_status]}
                          </p>
                        </div>
                        {isCurrentUser ? (
                          <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--brand)]">
                            Bạn
                          </span>
                        ) : null}
                      </div>

                      {attendanceActions.length > 0 ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {attendanceActions.map((action) => {
                            const isCurrentStatus = participant.attendance_status === action.status;

                            return (
                              <button
                                key={action.status}
                                type="button"
                                onClick={() => void updateAttendance(participant.id, action.status)}
                                disabled={isMutating || isCurrentStatus}
                                className={
                                  isCurrentStatus
                                    ? "rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80"
                                    : "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                                }
                              >
                                {isMutating && pendingParticipantId === participant.id ? "Đang xử lý..." : action.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
