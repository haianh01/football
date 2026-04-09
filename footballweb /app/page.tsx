import Link from "next/link";
import { getTranslations } from "next-intl/server";

const pillars = [
  {
    title: "Team Control",
    body: "Bắt đầu từ dashboard đội, role, công nợ, poll và action center thay vì chỉ làm landing page."
  },
  {
    title: "Match Engine",
    body: "Tìm đối, chốt trận, xác nhận tham gia và review được tách thành các domain rõ ràng."
  },
  {
    title: "Global-Ready Data",
    body: "Skill level, locale, timezone, currency và position code đã được chuẩn hóa từ docs."
  }
] as const;

const nextSteps = [
  "Auth -> Team creation -> Team dashboard",
  "Match post list/detail/create flow",
  "Attendance poll -> fee generation -> payment confirmation"
] as const;

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="surface-card brand-ring sticky top-4 z-20 rounded-3xl px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
              {t("eyebrow")}
            </p>
            <h1 className="mt-1 font-[var(--font-headline)] text-xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-2xl">
              {t("title")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/team/create"
              className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              Create Team
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
            >
              {t("loginCta")}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0b6b3a_0%,#1ea35a_54%,#f08c40_100%)] px-6 py-10 text-white sm:px-8 sm:py-14">
        <div className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-[-2rem] h-48 w-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
            {t("hero.label")}
          </p>
          <h2 className="mt-4 font-[var(--font-headline)] text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-white/82 sm:text-base">{t("hero.body")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/team/create"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--brand)] transition hover:translate-y-[-1px]"
            >
              {t("hero.primaryCta")}
            </Link>
            <a
              href="#foundation"
              className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("hero.secondaryCta")}
            </a>
          </div>
        </div>
      </section>

      <section id="foundation" className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                {t("foundation.label")}
              </p>
              <h3 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
                {t("foundation.title")}
              </h3>
            </div>
            <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
              {t("foundation.badge")}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-3xl bg-[var(--card-muted)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
                  {pillar.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="surface-card rounded-[2rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
            {t("stack.label")}
          </p>
          <h3 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            {t("stack.title")}
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-[var(--ink-soft)]">
            <li>Next.js App Router</li>
            <li>TypeScript strict mode</li>
            <li>Tailwind CSS foundation</li>
            <li>next-intl request config</li>
            <li>Auth.js route stub</li>
            <li>Prisma schema skeleton</li>
          </ul>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.5fr]">
        <aside className="surface-card rounded-[2rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
            {t("next.label")}
          </p>
          <h3 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            {t("next.title")}
          </h3>

          <ol className="mt-5 space-y-4">
            {nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-6 text-[var(--ink-soft)]">{step}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
            {t("docs.label")}
          </p>
          <h3 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            {t("docs.title")}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{t("docs.body")}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["00_PRODUCT_OVERVIEW.md", "10_TECH_STACK.md", "11_DATABASE_SCHEMA.md", "13_API_CONTRACTS.md"].map((file) => (
              <div key={file} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--brand-strong)]">
                {file}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
