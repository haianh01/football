import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("Login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <section className="surface-card w-full rounded-[2rem] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
          {t("label")}
        </p>
        <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{t("body")}</p>

        <div className="mt-6 rounded-3xl bg-[var(--card-muted)] p-5">
          <p className="text-sm font-semibold text-[var(--brand-strong)]">{t("placeholderTitle")}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{t("placeholderBody")}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/team/create"
            className="inline-flex rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
          >
            Tạo đội ngay
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
          >
            {t("backCta")}
          </Link>
        </div>
      </section>
    </main>
  );
}
