import { notFound } from "next/navigation";

import { TeamActionCenterSection, TeamOverviewSnapshotSection } from "@/features/team-management/team-dashboard-sections";
import { TeamScreenShell } from "@/features/team-management/team-screen-shell";
import { ApiError } from "@/lib/http";

import { getTeamPageData } from "./team-page-data";

export default async function TeamOverviewPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    const { dashboard, canManageFinance, canManageSettings } = await getTeamPageData(teamId);

    return (
      <TeamScreenShell
        team={dashboard.team_summary}
        activeTab="overview"
        canManageFinance={canManageFinance}
        canManageSettings={canManageSettings}
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <TeamActionCenterSection actionCenter={dashboard.action_center} />
          <TeamOverviewSnapshotSection
            team={dashboard.team_summary}
            memberSummary={dashboard.member_summary}
            pendingInvitations={dashboard.pending_match_invitations.length}
            upcomingMatches={dashboard.upcoming_matches.length}
            canManageFinance={canManageFinance}
            openFees={dashboard.open_fees}
          />
        </div>
      </TeamScreenShell>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
