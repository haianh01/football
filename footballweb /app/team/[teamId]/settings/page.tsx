import { notFound } from "next/navigation";

import { TeamRestrictedMessage } from "@/features/team-management/team-dashboard-sections";
import { TeamScreenShell } from "@/features/team-management/team-screen-shell";
import { TeamSettingsPanel } from "@/features/team-management/team-settings-panel";
import { ApiError } from "@/lib/http";

import { getTeamPageData } from "../team-page-data";

export default async function TeamSettingsPage({
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
        activeTab="settings"
        canManageFinance={canManageFinance}
        canManageSettings={canManageSettings}
      >
        {canManageSettings ? (
          <TeamSettingsPanel teamId={teamId} initialTeam={dashboard.team_summary} />
        ) : (
          <TeamRestrictedMessage
            title="Chỉ đội trưởng được chỉnh hồ sơ đội"
            description="Màn này dành cho việc cập nhật tên đội, mô tả, khu vực, màu sắc và cấu hình hiển thị. Nếu cần sửa, hãy dùng tài khoản captain."
          />
        )}
      </TeamScreenShell>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
