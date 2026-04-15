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

        <form action={googleLoginAction} className="mt-8">
          <input type="hidden" name="redirect_to" value={redirectTo || "/"} />
          <button
            type="submit"
            disabled={!isGoogleAuthEnabled}
            title={!isGoogleAuthEnabled ? "Bạn cần cấu hình AUTH_GOOGLE_ID và AUTH_GOOGLE_SECRET trong file .env" : ""}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đăng nhập bằng tài khoản Google
          </button>
        </form>

        {!isGoogleAuthEnabled ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            <strong>Cần cấu hình:</strong> Vui lòng đặt <code>AUTH_GOOGLE_ID</code> và <code>AUTH_GOOGLE_SECRET</code> trong file <code>.env</code> để Đăng nhập Google hoạt động chính xác.
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
          <span className="h-px flex-1 bg-black/10" />
          <span>Hoặc đăng nhập nhanh (Dev)</span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

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
