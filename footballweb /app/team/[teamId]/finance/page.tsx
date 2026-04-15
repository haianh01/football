import { notFound } from "next/navigation";

import { TeamOpenFeesSection, TeamRestrictedMessage } from "@/features/team-management/team-dashboard-sections";
import { TeamScreenShell } from "@/features/team-management/team-screen-shell";
import { ApiError } from "@/lib/http";

import { getTeamPageData } from "../team-page-data";

export default async function TeamFinancePage({
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
        activeTab="finance"
        canManageFinance={canManageFinance}
        canManageSettings={canManageSettings}
      >
        {canManageFinance ? (
          <TeamOpenFeesSection fees={dashboard.open_fees} />
        ) : (
          <TeamRestrictedMessage
            title="Màn tài chính đang mở cho captain hoặc treasurer"
            description="Nếu bạn là member, phần tạo khoản thu và xác nhận đã đóng vẫn thực hiện ở chi tiết kèo, nhưng dashboard tài chính tổng hợp hiện chỉ hiện cho captain và treasurer."
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
