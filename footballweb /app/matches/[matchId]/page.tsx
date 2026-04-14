import Link from "next/link";
import { notFound } from "next/navigation";

import { TeamAvatar } from "@/components/shared";
import { MatchParticipantPanel } from "@/features/matchmaking/match-participant-panel";
import { getMatchDetail, listMatchParticipants } from "@/features/matchmaking";
import { listTeamsForUser } from "@/features/team-management/service";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { ApiError } from "@/lib/http";

function formatFieldType(fieldType: "five" | "seven" | "eleven") {
  if (fieldType === "five") return "Sân 5";
  if (fieldType === "seven") return "Sân 7";
  return "Sân 11";
}

export default async function MatchDetailPage({
  params
}: {
  params: Promise<{ matchId: string }>;
}) {
  try {
    const currentUser = await requireCurrentUser();
    const { matchId } = await params;
    const [match, participants, userTeams] = await Promise.all([
      getMatchDetail(matchId, currentUser.id),
      listMatchParticipants(matchId, currentUser.id),
      listTeamsForUser(currentUser.id)
    ]);
    const captainTeamIds = userTeams
      .filter((team) => team.role_of_current_user === "captain")
      .map((team) => team.id)
      .filter((teamId) => teamId === match.home_team?.id || teamId === match.away_team?.id);

    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <TeamAvatar name={match.home_team?.name || "Home"} logoUrl={match.home_team?.logo_url || null} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">{match.status}</p>
                <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
                  {match.home_team?.name || "Đội nhà"} vs {match.away_team?.name || "Đội khách"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {match.date} • {match.start_time}
                  {match.end_time ? ` - ${match.end_time}` : ""} • {match.venue_name || "Chưa chốt sân"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--card-muted)] px-5 py-4 text-sm text-[var(--brand-strong)]">
              <p className="font-semibold">Participant Summary</p>
              <p className="mt-2">
                {match.participant_summary.confirmed_count} confirmed • {match.participant_summary.pending_count} pending
              </p>
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
