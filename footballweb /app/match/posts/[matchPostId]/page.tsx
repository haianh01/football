import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { TeamAvatar } from "@/components/shared";
import { MatchInvitationPanel } from "@/features/matchmaking/match-invitation-panel";
import { getMatchPostDetail, listMatchPostInvitations } from "@/features/matchmaking";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listTeamsForUser } from "@/features/team-management/service";
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

function formatPitchFeeRule(rule: "share" | "home_team_pays" | "away_team_pays" | "sponsor_supported") {
  switch (rule) {
    case "share":
      return "Chia sân";
    case "home_team_pays":
      return "Đội nhà trả";
    case "away_team_pays":
      return "Đội khách trả";
    case "sponsor_supported":
      return "Có hỗ trợ";
  }
}

export default async function MatchPostDetailPage({
  params
}: {
  params: Promise<{ matchPostId: string }>;
}) {
  try {
    const { matchPostId } = await params;
    const matchPost = await getMatchPostDetail(matchPostId);
    const currentUser = await getCurrentUser();
    const userTeams = currentUser ? await listTeamsForUser(currentUser.id) : [];
    const captainTeams = userTeams.filter((team) => team.role_of_current_user === "captain");
    const eligibleInviterTeams = captainTeams
      .filter((team) => team.id !== matchPost.team.id)
      .map((team) => ({
        id: team.id,
        name: team.name,
        short_code: team.short_code
      }));
    const targetTeamMembership = userTeams.find((team) => team.id === matchPost.team.id) ?? null;
    const isTargetCaptain = targetTeamMembership?.role_of_current_user === "captain";
    const isTargetMember = Boolean(targetTeamMembership);
    const canManageFinance = Boolean(targetTeamMembership);
    const targetTeamRole = targetTeamMembership?.role_of_current_user ?? null;
    const invitations = currentUser ? await listMatchPostInvitations(matchPostId, currentUser.id) : [];
    const scheduledMatchHasScoreline =
      matchPost.scheduled_match?.home_score !== null && matchPost.scheduled_match?.away_score !== null;

    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl items-start gap-4">
              <TeamAvatar name={matchPost.team.name} logoUrl={matchPost.team.logo_url} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">{matchPost.status}</p>
                <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
                  {matchPost.title || `${matchPost.team.name} đang tìm đối`}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Đội đăng: {matchPost.team.name} • {matchPost.team.short_code}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--card-muted)] px-5 py-4 text-sm text-[var(--brand-strong)]">
              <p className="font-semibold">Trust layer</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{matchPost.trust_metrics.note}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Thông tin trận</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Lịch đá</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {matchPost.date} • {matchPost.start_time}
                  {matchPost.end_time ? ` - ${matchPost.end_time}` : ""}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Khu vực</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {matchPost.city_code || "N/A"} • {matchPost.district_code || "N/A"}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Sân</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                  {matchPost.venue_name || "Chưa chốt sân"} • {formatFieldType(matchPost.field_type)}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Điều kiện phí</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">{formatPitchFeeRule(matchPost.pitch_fee_rule)}</p>
              </article>
            </div>

            <div className="mt-6 rounded-3xl bg-[var(--card-muted)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Trình độ mong muốn</p>
              <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                {matchPost.team_skill_min} → {matchPost.team_skill_max}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {matchPost.note || "Chưa có ghi chú chi tiết cho kèo này."}
              </p>
            </div>
          </div>

          <aside className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Hồ sơ đội</p>
            <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
              {matchPost.team.name}
            </h2>

            <dl className="mt-5 space-y-4 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center justify-between gap-4">
                <dt>Short code</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{matchPost.team.short_code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Số thành viên</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{matchPost.team.member_count}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Trình độ đội</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{matchPost.team.skill_level_code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Khu vực</dt>
                <dd className="font-bold text-[var(--brand-strong)]">
                  {matchPost.team.home_city_code || "N/A"} • {matchPost.team.home_district_code || "N/A"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3">
              {matchPost.scheduled_match ? (
                <div className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white">
                  Đã chốt trận: {matchPost.scheduled_match.home_team?.name || "Đội nhà"} vs{" "}
                  {matchPost.scheduled_match.away_team?.name || "Đội khách"}
                  {scheduledMatchHasScoreline
                    ? ` • ${matchPost.scheduled_match.home_score} - ${matchPost.scheduled_match.away_score}`
                    : ""}
                </div>
              ) : (
                <span className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-center text-sm font-semibold text-white">
                  Đang chờ một lời mời được chấp nhận để tạo trận chính thức
                </span>
              )}
              <Link
                href="/match/posts"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Quay lại danh sách
              </Link>
            </div>
          </aside>
        </section>

        {matchPost.scheduled_match ? (
          <section className="mt-6 surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Matched Fixture</p>
            <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">Kèo đã chốt</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                  {formatMatchStatus(matchPost.scheduled_match.status)}
                </p>
                <p className="mt-2 text-lg font-bold text-[var(--brand-strong)]">
                  {matchPost.scheduled_match.home_team?.name || "Đội nhà"} vs{" "}
                  {matchPost.scheduled_match.away_team?.name || "Đội khách"}
                </p>
                {scheduledMatchHasScoreline ? (
                  <p className="mt-3 text-3xl font-black text-[var(--brand-strong)]">
                    {matchPost.scheduled_match.home_score} - {matchPost.scheduled_match.away_score}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  {matchPost.scheduled_match.date} • {matchPost.scheduled_match.start_time}
                  {matchPost.scheduled_match.end_time ? ` - ${matchPost.scheduled_match.end_time}` : ""}
                </p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {matchPost.scheduled_match.venue_name || "Chưa chốt sân"} • {formatFieldType(matchPost.scheduled_match.field_type)}
                </p>
                {matchPost.scheduled_match.result_note ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{matchPost.scheduled_match.result_note}</p>
                ) : null}
              </div>
              <div className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Participant Summary</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Confirmed</p>
                    <p className="mt-1 text-2xl font-black text-[var(--brand-strong)]">
                      {matchPost.scheduled_match.participant_summary.confirmed_count}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Pending</p>
                    <p className="mt-1 text-2xl font-black text-[var(--brand-strong)]">
                      {matchPost.scheduled_match.participant_summary.pending_count}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/matches/${matchPost.scheduled_match.id}` as Route}
                  className="mt-4 inline-flex rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
                >
                  Xem trận đã chốt
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <MatchInvitationPanel
          matchPostId={matchPostId}
          matchPostStatus={matchPost.status}
          targetTeamId={matchPost.team.id}
          initialInvitations={invitations}
          eligibleInviterTeams={eligibleInviterTeams}
          isTargetCaptain={isTargetCaptain}
          isTargetMember={isTargetMember}
          canManageFinance={canManageFinance}
          targetTeamRole={targetTeamRole}
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
