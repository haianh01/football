import { notFound } from "next/navigation";

import { TeamUpcomingMatchesSection, TeamRestrictedMessage } from "@/features/team-management/team-dashboard-sections";
import { TeamScreenShell } from "@/features/team-management/team-screen-shell";
import { TeamMatchInvitationInbox } from "@/features/matchmaking/team-match-invitation-inbox";
import { ApiError } from "@/lib/http";

import { getTeamPageData } from "../team-page-data";

export default async function TeamMatchesPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    const { dashboard, canManageFinance, canManageSettings } = await getTeamPageData(teamId);
    const isCaptain = dashboard.team_summary.role_of_current_user === "captain";

    return (
      <TeamScreenShell
        team={dashboard.team_summary}
        activeTab="matches"
        canManageFinance={canManageFinance}
        canManageSettings={canManageSettings}
      >
        {isCaptain ? (
          <TeamMatchInvitationInbox initialInvitations={dashboard.pending_match_invitations} />
        ) : (
          <TeamRestrictedMessage
            title="Chỉ đội trưởng duyệt lời mời chốt kèo"
            description="Bạn vẫn xem được danh sách trận đã chốt ở dưới, nhưng thao tác chấp nhận hoặc từ chối lời mời hiện chỉ mở cho captain."
          />
        )}

        <div className="mt-6">
          <TeamUpcomingMatchesSection matches={dashboard.upcoming_matches} teamId={teamId} />
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
