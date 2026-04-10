import Link from "next/link";
import { notFound } from "next/navigation";

import { TeamAvatar } from "@/components/shared";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { ApiError } from "@/lib/http";
import { getTeamDashboard } from "@/features/team-management/service";

export default async function TeamDashboardPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    const currentUser = await requireCurrentUser();
    const dashboard = await getTeamDashboard(teamId, currentUser.id);

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
                  Captain flow đã sẵn sàng: đội được tạo, membership được gán và dashboard cơ bản đã có action center để tiếp tục sang
                  matchmaking, poll và finance.
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
          </aside>
        </section>

        <section className="mt-6 surface-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Members</p>
              <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
                Danh sách thành viên
              </h2>
            </div>
            <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
              {dashboard.members.length} records
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-black/8 bg-white">
            <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-black/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
              <span>Thành viên</span>
              <span>Role</span>
              <span>Attendance</span>
              <span>Công nợ</span>
            </div>

            {dashboard.members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-black/6 px-4 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-[var(--brand-strong)]">{member.display_name}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{member.status}</p>
                </div>
                <span className="font-semibold uppercase text-[var(--brand)]">{member.role}</span>
                <span className="font-medium text-[var(--brand-strong)]">{member.attendance_rate}%</span>
                <span className="font-medium text-[var(--brand-strong)]">
                  {member.current_debt_amount_minor.toLocaleString("vi-VN")} {member.currency_code}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
