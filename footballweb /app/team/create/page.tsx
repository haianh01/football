import Link from "next/link";

import { TeamCreateForm } from "@/features/team-management/team-create-form";
import { requirePageUser } from "@/lib/auth/current-user";

export default async function CreateTeamPage() {
  await requirePageUser("/login?redirectTo=/team/create");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-6">
      <div className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
          Team Creation
        </p>
        <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)]">
          Tạo đội đầu tiên
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Đây là entry point của toàn hệ thống. Sau khi tạo đội, captain sẽ có dashboard đội cơ bản và có thể đi tiếp sang
          flow matchmaking.
        </p>

        <TeamCreateForm />
      </div>
    </main>
  );
}
