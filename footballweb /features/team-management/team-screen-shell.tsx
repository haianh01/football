import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";

import { TeamAvatar } from "@/components/shared";

import type { TeamSummary } from "./types";

type TeamScreenTab = "overview" | "members" | "matches" | "finance" | "settings";

function buildTeamTabHref(teamId: string, tab: TeamScreenTab): Route {
  if (tab === "overview") {
    return `/team/${teamId}` as Route;
  }

  return `/team/${teamId}/${tab}` as Route;
}

function buildTabClass(active: boolean) {
  return active
    ? "rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white"
    : "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70";
}

export function TeamScreenShell({
  team,
  activeTab,
  canManageFinance,
  canManageSettings,
  children
}: {
  team: TeamSummary;
  activeTab: TeamScreenTab;
  canManageFinance: boolean;
  canManageSettings: boolean;
  children: ReactNode;
}) {
  const tabs: Array<{ id: TeamScreenTab; label: string }> = [
    { id: "overview", label: "Tổng quan" },
    { id: "members", label: "Thành viên" },
    { id: "matches", label: "Kèo & trận" }
  ];

  if (canManageFinance) {
    tabs.push({ id: "finance", label: "Tài chính" });
  }

  if (canManageSettings) {
    tabs.push({ id: "settings", label: "Cài đặt" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="surface-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl items-start gap-4">
            <TeamAvatar name={team.name} logoUrl={team.logo_url} size="lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Team Workspace</p>
              <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
                {team.name}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {team.description || "Tách dashboard đội thành nhiều màn để xử lý thành viên, kèo, tài chính và cài đặt rõ ràng hơn."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:min-w-[260px]">
            <div className="rounded-3xl bg-[var(--card-muted)] px-5 py-4 text-sm text-[var(--brand-strong)]">
              <p className="font-semibold">Vai trò hiện tại</p>
              <p className="mt-1 text-lg font-extrabold uppercase">{team.role_of_current_user}</p>
              <p className="mt-2 text-xs text-[var(--ink-soft)]">
                {team.short_code}
                {team.home_city_code ? ` • ${team.home_city_code}` : ""}
                {team.home_district_code ? ` • ${team.home_district_code}` : ""}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/match/posts/create"
                className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                Đăng kèo
              </Link>
              <Link
                href="/match/posts"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
              >
                Danh sách kèo
              </Link>
              <Link
                href="/team/create"
                className="rounded-2xl border border-black/10 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70 sm:col-span-2"
              >
                Tạo thêm đội
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6 surface-card rounded-[2rem] p-4">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Link key={tab.id} href={buildTeamTabHref(team.id, tab.id)} className={buildTabClass(activeTab === tab.id)}>
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      {children}
    </main>
  );
}
