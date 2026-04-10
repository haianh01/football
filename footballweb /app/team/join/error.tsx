"use client";

import Link from "next/link";

export default function TeamJoinErrorPage({ error }: { error: Error & { digest?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-6">
      <div className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Team Join</p>
        <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)]">
          Không thể join team
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          {error.message || "Có lỗi xảy ra khi xử lý mã mời."}
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-[var(--ink-soft)]">Digest: {error.digest}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/team/join"
            className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-center text-sm font-bold text-white transition hover:translate-y-[-1px]"
          >
            Thử lại
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-black/10 px-5 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
          >
            Về trang chính
          </Link>
        </div>
      </div>
    </main>
  );
}

