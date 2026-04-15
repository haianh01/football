import Link from "next/link";
import type { Route } from "next";

import type { TeamFeeSummary } from "@/features/team-finance";

import type { TeamDashboard, TeamDashboardUpcomingMatch, TeamSummary } from "./types";

function formatFieldType(fieldType: "five" | "seven" | "eleven") {
  if (fieldType === "five") return "Sân 5";
  if (fieldType === "seven") return "Sân 7";
  return "Sân 11";
}

function formatMoney(amountMinor: number, currencyCode: string) {
  return `${amountMinor.toLocaleString("vi-VN")} ${currencyCode}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function buildManageCopy(match: TeamDashboardUpcomingMatch) {
  if (match.current_team_shortage > 0) {
    return `Thiếu ${match.current_team_shortage} người • ${match.current_team_available_count}/${match.current_team_required_players} khả dụng`;
  }

  return `Đủ quân sơ bộ • ${match.current_team_available_count}/${match.current_team_required_players} khả dụng`;
}

export function TeamActionCenterSection({
  actionCenter
}: {
  actionCenter: TeamDashboard["action_center"];
}) {
  const cards = [
    {
      label: "Pending Confirmations",
      value: actionCenter.pending_confirmations
    },
    {
      label: "Open Polls",
      value: actionCenter.open_polls
    },
    {
      label: "Overdue Fees",
      value: actionCenter.overdue_fee_assignees
    },
    {
      label: "Upcoming Shortage",
      value: actionCenter.upcoming_match_shortage,
      note: "Số cầu thủ còn thiếu để đủ quân cho các trận sắp tới."
    }
  ];

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Action Center</p>
      <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
        Việc cần xử lý hôm nay
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <article key={card.label} className="rounded-3xl bg-[var(--card-muted)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{card.label}</p>
            <p className="mt-3 font-[var(--font-headline)] text-4xl font-black text-[var(--brand-strong)]">{card.value}</p>
            {card.note ? <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">{card.note}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function TeamOverviewSnapshotSection({
  team,
  memberSummary,
  pendingInvitations,
  upcomingMatches,
  canManageFinance,
  openFees
}: {
  team: TeamSummary;
  memberSummary: TeamDashboard["member_summary"];
  pendingInvitations: number;
  upcomingMatches: number;
  canManageFinance: boolean;
  openFees: TeamFeeSummary[];
}) {
  return (
    <section className="surface-card rounded-[2rem] p-6">
      <aside>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Snapshot</p>
        <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
          Tóm tắt đội
        </h2>

        <dl className="mt-5 space-y-4 text-sm text-[var(--ink-soft)]">
          <div className="flex items-center justify-between gap-4">
            <dt>Team code</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{team.short_code}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Trình độ đội</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{team.skill_level_code}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Số thành viên</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{team.member_count}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Active members</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{memberSummary.active_members}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Attendance avg</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{memberSummary.average_attendance_rate}%</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Lời mời chờ xử lý</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{pendingInvitations}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Trận sắp tới</dt>
            <dd className="font-bold text-[var(--brand-strong)]">{upcomingMatches}</dd>
          </div>
          {canManageFinance ? (
            <div className="flex items-center justify-between gap-4">
              <dt>Khoản thu đang mở</dt>
              <dd className="font-bold text-[var(--brand-strong)]">{openFees.length}</dd>
            </div>
          ) : null}
        </dl>
      </aside>
    </section>
  );
}

export function TeamOpenFeesSection({
  fees
}: {
  fees: TeamFeeSummary[];
}) {
  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Finance</p>
          <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            Khoản thu đang mở
          </h2>
        </div>
        <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {fees.length} khoản
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {fees.length === 0 ? (
          <div className="rounded-3xl bg-[var(--card-muted)] px-4 py-4 text-sm text-[var(--ink-soft)] lg:col-span-2">
            Chưa có khoản thu nào được tạo từ lời mời chốt kèo đã accept.
          </div>
        ) : (
          fees.map((fee) => (
            <article key={fee.id} className="rounded-3xl bg-[var(--card-muted)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{fee.status}</p>
              <h3 className="mt-2 text-lg font-bold text-[var(--brand-strong)]">{fee.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Tổng thu {formatMoney(fee.total_amount_minor, fee.currency_code)} • Hạn {formatDateTime(fee.due_at)}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--brand-strong)]">
                {fee.paid_count}/{fee.assignee_count} người đã đóng • {fee.overdue_count} quá hạn
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Vào chi tiết kèo để tạo khoản thu mới hoặc xác nhận ai đã đóng.</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function TeamUpcomingMatchesSection({
  matches,
  teamId
}: {
  matches: TeamDashboardUpcomingMatch[];
  teamId: string;
}) {
  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Upcoming Matches</p>
          <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            Trận đã chốt
          </h2>
        </div>
        <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {matches.length} fixtures
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {matches.length === 0 ? (
          <div className="rounded-3xl bg-[var(--card-muted)] px-4 py-4 text-sm text-[var(--ink-soft)] lg:col-span-2">
            Chưa có trận nào được chốt từ lời mời hiện tại.
          </div>
        ) : (
          matches.map((match) => {
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
                <p className="mt-2 text-sm font-medium text-[var(--brand-strong)]">{buildManageCopy(match)}</p>
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
  );
}

export function TeamRestrictedMessage({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Giới Hạn Quyền</p>
      <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
    </section>
  );
}
