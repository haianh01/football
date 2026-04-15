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

function buildStatsDraft(participant: MatchParticipantSummary) {
  return {
    goals: participant.goals.toString(),
    assists: participant.assists.toString(),
    is_mvp: participant.is_mvp
  };
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
  const [statsDrafts, setStatsDrafts] = useState<Record<string, { goals: string; assists: string; is_mvp: boolean }>>(
    () =>
      Object.fromEntries(
        initialParticipants.map((participant) => [participant.id, buildStatsDraft(participant)])
      )
  );

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

  async function updateStats(participantId: string) {
    const draft = statsDrafts[participantId];

    if (!draft) {
      return;
    }

    setPendingParticipantId(participantId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/matches/${matchId}/participants/${participantId}/stats`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goals: Number(draft.goals),
          assists: Number(draft.assists),
          is_mvp: draft.is_mvp
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | MatchInvitationApiSuccess<MatchParticipantSummary>
        | MatchInvitationApiFailure
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as MatchInvitationApiFailure | null, "Không thể cập nhật stats cầu thủ."));
        return;
      }

      setParticipants((currentParticipants) =>
        currentParticipants.map((participant) => (participant.id === participantId ? payload.data : participant))
      );
      setStatsDrafts((currentDrafts) => ({
        ...currentDrafts,
        [participantId]: buildStatsDraft(payload.data)
      }));
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
                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-[var(--brand-strong)]">
                              G {participant.goals}
                            </span>
                            <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-[var(--brand-strong)]">
                              A {participant.assists}
                            </span>
                            {participant.is_mvp ? (
                              <span className="rounded-full bg-[var(--brand)] px-3 py-1 text-white">MVP</span>
                            ) : null}
                          </div>
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

                      {canCaptainManage ? (
                        <div className="mt-4 rounded-2xl bg-[var(--card-muted)] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                            Match Stats
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-[0.8fr_0.8fr_1fr_auto] sm:items-end">
                            <label className="grid gap-2 text-xs font-medium text-[var(--brand-strong)]">
                              Goals
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={statsDrafts[participant.id]?.goals ?? "0"}
                                onChange={(event) =>
                                  setStatsDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [participant.id]: {
                                      ...(currentDrafts[participant.id] ?? buildStatsDraft(participant)),
                                      goals: event.target.value
                                    }
                                  }))
                                }
                                disabled={isMutating}
                                className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
                              />
                            </label>

                            <label className="grid gap-2 text-xs font-medium text-[var(--brand-strong)]">
                              Assists
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={statsDrafts[participant.id]?.assists ?? "0"}
                                onChange={(event) =>
                                  setStatsDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [participant.id]: {
                                      ...(currentDrafts[participant.id] ?? buildStatsDraft(participant)),
                                      assists: event.target.value
                                    }
                                  }))
                                }
                                disabled={isMutating}
                                className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
                              />
                            </label>

                            <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-[var(--brand-strong)]">
                              <input
                                type="checkbox"
                                checked={statsDrafts[participant.id]?.is_mvp ?? false}
                                onChange={(event) =>
                                  setStatsDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [participant.id]: {
                                      ...(currentDrafts[participant.id] ?? buildStatsDraft(participant)),
                                      is_mvp: event.target.checked
                                    }
                                  }))
                                }
                                disabled={isMutating}
                              />
                              MVP tạm
                            </label>

                            <button
                              type="button"
                              onClick={() => void updateStats(participant.id)}
                              disabled={isMutating}
                              className="rounded-2xl bg-[var(--brand-strong)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isMutating ? "Đang lưu..." : "Lưu stats"}
                            </button>
                          </div>
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
