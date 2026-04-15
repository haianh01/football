import { notFound } from "next/navigation";

import { TeamMemberPanel } from "@/features/team-management/team-member-panel";
import { TeamInvitePanel } from "@/features/team-management/team-invite-panel";
import { TeamScreenShell } from "@/features/team-management/team-screen-shell";
import { ApiError } from "@/lib/http";

import { getTeamPageData } from "../team-page-data";

export default async function TeamMembersPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    const { currentUser, dashboard, invites, canManageFinance, canManageSettings } = await getTeamPageData(teamId);

    return (
      <TeamScreenShell
        team={dashboard.team_summary}
        activeTab="members"
        canManageFinance={canManageFinance}
        canManageSettings={canManageSettings}
      >
        <TeamMemberPanel
          teamId={teamId}
          currentUserId={currentUser.id}
          currentUserRole={dashboard.team_summary.role_of_current_user}
          initialMembers={dashboard.members}
        />

        {dashboard.team_summary.role_of_current_user === "captain" ? (
          <TeamInvitePanel teamId={teamId} initialInvites={invites} />
        ) : null}
      </TeamScreenShell>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
