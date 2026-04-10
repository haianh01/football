import Link from "next/link";

import { acceptTeamInviteAction } from "@/features/team-management/invite-actions";

export default async function TeamJoinPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const code = typeof resolvedSearchParams?.code === "string" ? resolvedSearchParams.code : "";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-6">
      <div className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Team Join</p>
        <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)]">
          Join team bằng mã mời
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Nhập mã mời do captain tạo. Sau khi join thành công bạn sẽ được chuyển vào team dashboard.
        </p>

        <form action={acceptTeamInviteAction} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Mã mời
            <input
              required
              name="invite_code"
              defaultValue={code}
              placeholder="VPINV-XXXXXXXXXX"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px]"
            >
              Join ngay
            </button>
            <Link
              href="/"
              className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
            >
              Về trang chính
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

