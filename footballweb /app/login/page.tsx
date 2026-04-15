import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isGoogleAuthEnabled } from "@/auth";
import { googleLoginAction } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/login-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("Login");
  const currentUser = await getCurrentUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectTo = typeof resolvedSearchParams?.redirectTo === "string" ? resolvedSearchParams.redirectTo : "/";

  if (currentUser) {
    redirect((redirectTo || "/") as never);
  }

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

        {isGoogleAuthEnabled ? (
          <form action={googleLoginAction} className="mt-6">
            <input type="hidden" name="redirect_to" value={redirectTo || "/"} />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
            >
              Tiếp tục với Google
            </button>
          </form>
        ) : null}

        {isGoogleAuthEnabled ? (
          <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            <span className="h-px flex-1 bg-black/10" />
            <span>Hoặc dùng email</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>
        ) : null}

        <LoginForm redirectTo={redirectTo || "/"} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
