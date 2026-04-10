import Link from "next/link";
import { notFound } from "next/navigation";

import { TeamAvatar } from "@/components/shared";
import { getMatchPostDetail } from "@/features/matchmaking";
import { ApiError } from "@/lib/http";

function formatFieldType(fieldType: "five" | "seven" | "eleven") {
  if (fieldType === "five") return "Sân 5";
  if (fieldType === "seven") return "Sân 7";
  return "Sân 11";
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
                {matchPost.note || "Chưa có ghi chú chi tiết. Luồng invitation và chốt kèo sẽ bổ sung ở slice tiếp theo."}
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
              <span className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-center text-sm font-semibold text-white">
                Chốt kèo sẽ bật ở slice invitation
              </span>
              <Link
                href="/match/posts"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Quay lại danh sách
              </Link>
            </div>
          </aside>
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
