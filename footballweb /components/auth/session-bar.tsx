import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function SessionBar() {
  const currentUser = await getCurrentUser();

  return (
    <div className="border-b border-black/8 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          V-Pitch
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/match/posts"
            className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
          >
            Match Posts
          </Link>

          {currentUser ? (
            <>
              <span className="rounded-full bg-[var(--card-muted)] px-3 py-2 text-sm font-semibold text-[var(--brand-strong)]">
                {currentUser.display_name}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
                >
                  Đăng xuất
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
