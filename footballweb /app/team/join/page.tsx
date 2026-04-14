import { TeamJoinForm } from "@/features/team-management/team-join-form";

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

        <TeamJoinForm initialCode={code} />
      </div>
    </main>
  );
}
