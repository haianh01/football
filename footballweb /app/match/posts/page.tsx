import Link from "next/link";

import { TeamAvatar } from "@/components/shared";
import { listMatchPosts } from "@/features/matchmaking";

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

export default async function MatchPostsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : undefined;
  const field_type =
    typeof resolvedSearchParams?.field_type === "string" &&
    ["five", "seven", "eleven"].includes(resolvedSearchParams.field_type)
      ? (resolvedSearchParams.field_type as "five" | "seven" | "eleven")
      : undefined;

  const matchPosts = await listMatchPosts({
    q,
    field_type
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Matchmaking</p>
            <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
              Tìm đối đang mở
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Slice đầu của Matchmaking ưu tiên list, detail và create match post. Trust metrics sâu sẽ được nối tiếp khi domain
              reputation được bật.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/match/posts/create"
              className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              Đăng kèo
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-black/10 px-5 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
            >
              Về trang chính
            </Link>
          </div>
        </div>

        <form className="mt-6 grid gap-3 rounded-3xl bg-[var(--card-muted)] p-4 md:grid-cols-[1.6fr_0.9fr_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Tìm tên đội, sân hoặc khu vực..."
            className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
          />
          <select
            name="field_type"
            defaultValue={field_type}
            className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">Loại sân</option>
            <option value="five">Sân 5</option>
            <option value="seven">Sân 7</option>
            <option value="eleven">Sân 11</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
          >
            Lọc kèo
          </button>
        </form>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {matchPosts.length === 0 ? (
          <div className="surface-card rounded-[2rem] p-8 text-sm text-[var(--ink-soft)] lg:col-span-2">
            Chưa có kèo phù hợp với bộ lọc hiện tại. Bạn có thể nới filter hoặc đăng kèo mới.
          </div>
        ) : (
          matchPosts.map((matchPost) => (
            <article key={matchPost.id} className="surface-card rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <TeamAvatar name={matchPost.team.name} logoUrl={matchPost.team.logo_url} size="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                      {matchPost.status.replaceAll("_", " ")}
                    </p>
                    <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
                      {matchPost.team.name}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {matchPost.title || "Kèo giao lưu đang mở"} • {matchPost.team.short_code}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                  {matchPost.urgency}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Lịch đá</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                    {matchPost.date} • {matchPost.start_time}
                    {matchPost.end_time ? ` - ${matchPost.end_time}` : ""}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Địa điểm</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                    {matchPost.venue_name || matchPost.district_code || "Chưa chốt địa điểm"}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Điều kiện</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                    {formatFieldType(matchPost.field_type)} • {formatPitchFeeRule(matchPost.pitch_fee_rule)}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Trust layer</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--brand-strong)]">
                    {matchPost.team.member_count} thành viên • Reputation đang chờ module review
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/match/posts/${matchPost.id}`}
                  className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Xem chi tiết
                </Link>
                <span className="rounded-2xl border border-black/10 px-5 py-3 text-center text-sm font-medium text-[var(--ink-soft)]">
                  CTA chốt kèo sẽ nằm ở detail page
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
