import Link from "next/link";
import { notFound } from "next/navigation";

import { TeamAvatar } from "@/components/shared";
import { MatchLifecyclePanel } from "@/features/matchmaking/match-lifecycle-panel";
import { MatchParticipantPanel } from "@/features/matchmaking/match-participant-panel";
import { getMatchDetail, listMatchParticipants } from "@/features/matchmaking";
import { listTeamsForUser } from "@/features/team-management/service";
import { requirePageUser } from "@/lib/auth/current-user";
import { ApiError } from "@/lib/http";

function formatFieldType(fieldType: "five" | "seven" | "eleven") {
  if (fieldType === "five") return "Sân 5";
  if (fieldType === "seven") return "Sân 7";
  return "Sân 11";
}

function formatMatchStatus(status: "scheduled" | "confirmed" | "completed" | "cancelled") {
  if (status === "scheduled") return "Scheduled";
  if (status === "confirmed") return "Confirmed";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

function sortParticipantsByMetric(
  participants: Array<{
    id: string;
    goals: number;
    assists: number;
    is_mvp: boolean;
    user: {
      display_name: string;
    };
  }>,
  metric: "goals" | "assists"
) {
  return [...participants]
    .filter((participant) => participant[metric] > 0)
    .sort((left, right) => right[metric] - left[metric] || left.user.display_name.localeCompare(right.user.display_name));
}

export default async function MatchDetailPage({
  params
}: {
  params: Promise<{ matchId: string }>;
}) {
  try {
    const { matchId } = await params;
    const currentUser = await requirePageUser(`/login?redirectTo=/matches/${matchId}`);
    const [match, participants, userTeams] = await Promise.all([
      getMatchDetail(matchId, currentUser.id),
      listMatchParticipants(matchId, currentUser.id),
      listTeamsForUser(currentUser.id)
    ]);
    const captainTeamIds = userTeams
      .filter((team) => team.role_of_current_user === "captain")
      .map((team) => team.id)
      .filter((teamId) => teamId === match.home_team?.id || teamId === match.away_team?.id);
    const canManageMatch = captainTeamIds.length > 0;
    const hasScoreline = match.home_score !== null && match.away_score !== null;
    const topScorers = sortParticipantsByMetric(participants, "goals");
    const topAssistLeaders = sortParticipantsByMetric(participants, "assists");
    const mvpHighlights = participants.filter((participant) => participant.is_mvp);
    const showRecap = hasScoreline || topScorers.length > 0 || topAssistLeaders.length > 0 || mvpHighlights.length > 0;

    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <TeamAvatar name={match.home_team?.name || "Home"} logoUrl={match.home_team?.logo_url || null} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">{formatMatchStatus(match.status)}</p>
                <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
                  {match.home_team?.name || "Đội nhà"} vs {match.away_team?.name || "Đội khách"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {match.date} • {match.start_time}
                  {match.end_time ? ` - ${match.end_time}` : ""} • {match.venue_name || "Chưa chốt sân"}
                </p>
                {match.result_note ? <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{match.result_note}</p> : null}
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-[220px]">
              {hasScoreline ? (
                <div className="rounded-3xl bg-[var(--brand-strong)] px-5 py-4 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Score</p>
                  <p className="mt-2 text-3xl font-black">
                    {match.home_score} - {match.away_score}
                  </p>
                </div>
              ) : null}
              <div className="rounded-3xl bg-[var(--card-muted)] px-5 py-4 text-sm text-[var(--brand-strong)]">
                <p className="font-semibold">Participant Summary</p>
                <p className="mt-2">
                  {match.participant_summary.confirmed_count} confirmed • {match.participant_summary.pending_count} pending
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Fixture</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Lịch đá</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {match.date} • {match.start_time}
                  {match.end_time ? ` - ${match.end_time}` : ""}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Sân</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {match.venue_name || "Chưa chốt sân"} • {formatFieldType(match.field_type)}
                </p>
              </article>
            </div>
          </div>

          <aside className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Actions</p>
            <div className="mt-4 flex flex-col gap-3">
              {match.source_match_post_id ? (
                <Link
                  href={`/match/posts/${match.source_match_post_id}`}
                  className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Về kèo gốc
                </Link>
              ) : null}
              <Link
                href="/match/posts"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Xem danh sách kèo
              </Link>
            </div>
          </aside>
        </section>

        {canManageMatch ? <MatchLifecyclePanel matchId={match.id} initialMatch={match} /> : null}

        {showRecap ? (
          <section className="mt-6 surface-card rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Post-Match Recap</p>
                <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
                  Tóm tắt sau trận
                </h2>
              </div>
              {hasScoreline ? (
                <div className="rounded-3xl bg-[var(--brand-strong)] px-5 py-4 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Final Score</p>
                  <p className="mt-2 text-3xl font-black">
                    {match.home_score} - {match.away_score}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Scorers</p>
                <div className="mt-4 grid gap-3">
                  {topScorers.length > 0 ? (
                    topScorers.map((participant) => (
                      <div key={participant.id} className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-[var(--brand-strong)]">{participant.user.display_name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--brand)]">{participant.goals} goals</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">Chưa có dữ liệu ghi bàn.</p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Assists</p>
                <div className="mt-4 grid gap-3">
                  {topAssistLeaders.length > 0 ? (
                    topAssistLeaders.map((participant) => (
                      <div key={participant.id} className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-[var(--brand-strong)]">{participant.user.display_name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--brand)]">
                          {participant.assists} assists
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">Chưa có dữ liệu kiến tạo.</p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">MVP Highlights</p>
                <div className="mt-4 grid gap-3">
                  {mvpHighlights.length > 0 ? (
                    mvpHighlights.map((participant) => (
                      <div key={participant.id} className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-[var(--brand-strong)]">{participant.user.display_name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--brand)]">MVP tạm</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">
                      Chưa có cầu thủ được đánh dấu MVP.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        <MatchParticipantPanel
          matchId={match.id}
          currentUserId={currentUser.id}
          initialParticipants={participants}
          captainTeamIds={captainTeamIds}
          homeTeamId={match.home_team?.id ?? null}
          awayTeamId={match.away_team?.id ?? null}
          homeTeamName={match.home_team?.name || "Đội nhà"}
          awayTeamName={match.away_team?.name || "Đội khách"}
        />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
