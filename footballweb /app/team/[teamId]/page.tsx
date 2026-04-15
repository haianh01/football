import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { TeamAvatar } from "@/components/shared";
import { TeamMatchInvitationInbox } from "@/features/matchmaking/team-match-invitation-inbox";
import { TeamMemberPanel } from "@/features/team-management/team-member-panel";
import { TeamSettingsPanel } from "@/features/team-management/team-settings-panel";
import { requirePageUser } from "@/lib/auth/current-user";
import { ApiError } from "@/lib/http";
import { getTeamDashboard, listTeamInvites } from "@/features/team-management/service";
import { TeamInvitePanel } from "@/features/team-management/team-invite-panel";

function formatFieldType(fieldType: "five" | "seven" | "eleven") {
  if (fieldType === "five") return "Sân 5";
  if (fieldType === "seven") return "Sân 7";
  return "Sân 11";
}

export default async function TeamDashboardPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    const currentUser = await requirePageUser(`/login?redirectTo=/team/${teamId}`);
    const dashboard = await getTeamDashboard(teamId, currentUser.id);
    const invites =
      dashboard.team_summary.role_of_current_user === "captain" ? await listTeamInvites(teamId, currentUser.id) : [];

    return (
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl items-start gap-4">
              <TeamAvatar
                name={dashboard.team_summary.name}
                logoUrl={dashboard.team_summary.logo_url}
                size="lg"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Team Dashboard</p>
                <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
                  {dashboard.team_summary.name}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Dashboard đã nối được luồng tạo đội, mời thành viên, lời mời chốt kèo và trận đã chốt để đội trưởng theo dõi ở một chỗ.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--card-muted)] px-5 py-4 text-sm text-[var(--brand-strong)]">
              <p className="font-semibold">Vai trò hiện tại</p>
              <p className="mt-1 text-lg font-extrabold uppercase">{dashboard.team_summary.role_of_current_user}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Action Center</p>
            <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
              Việc cần xử lý hôm nay
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Pending Confirmations</p>
                <p className="mt-3 font-[var(--font-headline)] text-4xl font-black text-[var(--brand-strong)]">
                  {dashboard.action_center.pending_confirmations}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Open Polls</p>
                <p className="mt-3 font-[var(--font-headline)] text-4xl font-black text-[var(--brand-strong)]">
                  {dashboard.action_center.open_polls}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Overdue Fees</p>
                <p className="mt-3 font-[var(--font-headline)] text-4xl font-black text-[var(--brand-strong)]">
                  {dashboard.action_center.overdue_fee_assignees}
                </p>
              </article>
              <article className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Upcoming Shortage</p>
                <p className="mt-3 font-[var(--font-headline)] text-4xl font-black text-[var(--brand-strong)]">
                  {dashboard.action_center.upcoming_match_shortage}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">Số cầu thủ còn thiếu để đủ quân cho các trận sắp tới.</p>
              </article>
            </div>
          </div>

          <aside className="surface-card rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Team Summary</p>
            <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
              Snapshot
            </h2>

            <dl className="mt-5 space-y-4 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center justify-between gap-4">
                <dt>Team code</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{dashboard.team_summary.short_code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Trình độ đội</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{dashboard.team_summary.skill_level_code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Số thành viên</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{dashboard.team_summary.member_count}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Active members</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{dashboard.member_summary.active_members}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Attendance avg</dt>
                <dd className="font-bold text-[var(--brand-strong)]">{dashboard.member_summary.average_attendance_rate}%</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/match/posts/create"
                className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                Đăng kèo tìm đối
              </Link>
              <Link
                href="/team/create"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Tạo thêm đội
              </Link>
              <Link
                href="/match/posts"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Xem danh sách kèo
              </Link>
            </div>

            {dashboard.team_summary.role_of_current_user === "captain" ? (
              <>
                <TeamSettingsPanel teamId={teamId} initialTeam={dashboard.team_summary} />
                <TeamInvitePanel teamId={teamId} initialInvites={invites} />
              </>
            ) : null}
          </aside>
        </section>

        <section className="mt-6 surface-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Upcoming Matches</p>
              <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">Trận đã chốt</h2>
            </div>
            <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
              {dashboard.upcoming_matches.length} fixtures
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {dashboard.upcoming_matches.length === 0 ? (
              <div className="rounded-3xl bg-[var(--card-muted)] px-4 py-4 text-sm text-[var(--ink-soft)] lg:col-span-2">
                Chưa có trận nào được chốt từ lời mời hiện tại.
              </div>
            ) : (
              dashboard.upcoming_matches.map((match) => {
                const opponent = match.home_team?.id === teamId ? match.away_team : match.home_team;

                return (
                  <article key={match.id} className="rounded-3xl bg-[var(--card-muted)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{match.status}</p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--brand-strong)]">
                      {opponent ? `vs ${opponent.name}` : "Đối thủ đang cập nhật"}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {match.date} • {match.start_time}
                      {match.end_time ? ` - ${match.end_time}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {match.venue_name || "Chưa chốt sân"} • {formatFieldType(match.field_type)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--brand-strong)]">
                      {match.current_team_shortage > 0
                        ? `Thiếu ${match.current_team_shortage} người • ${match.current_team_available_count}/${match.current_team_required_players} khả dụng`
                        : `Đủ quân sơ bộ • ${match.current_team_available_count}/${match.current_team_required_players} khả dụng`}
                    </p>
                    <Link
                      href={`/matches/${match.id}` as Route}
                      className="mt-4 inline-flex rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
                    >
                      Xem trận
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <TeamMemberPanel
          teamId={teamId}
          currentUserId={currentUser.id}
          currentUserRole={dashboard.team_summary.role_of_current_user}
          initialMembers={dashboard.members}
        />

        {dashboard.team_summary.role_of_current_user === "captain" ? (
          <TeamMatchInvitationInbox initialInvitations={dashboard.pending_match_invitations} />
        ) : null}
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
