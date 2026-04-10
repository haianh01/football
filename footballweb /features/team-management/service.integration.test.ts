import { beforeEach, describe, expect, it } from "vitest";

import { integrationDb } from "@/test/integration/prisma";

describe("team-management service integration", () => {
  const captainId = "11111111-1111-1111-1111-111111111111";

  beforeEach(async () => {
    await integrationDb.user.create({
      data: {
        id: captainId,
        email: "captain@example.com",
        display_name: "Captain",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });
  });

  it("createTeam persists team and captain membership in real DB", async () => {
    const { createTeam } = await import("./service");

    const team = await createTeam(
      {
        name: "FC Integration",
        skill_level_code: "L3_INTERMEDIATE",
        home_city_code: "HCM"
      },
      captainId
    );

    const persistedTeam = await integrationDb.team.findUnique({
      where: {
        id: team.id
      }
    });

    const membership = await integrationDb.teamMember.findUnique({
      where: {
        team_id_user_id: {
          team_id: team.id,
          user_id: captainId
        }
      }
    });

    expect(persistedTeam).toBeTruthy();
    expect(persistedTeam?.name).toBe("FC Integration");
    expect(membership?.role).toBe("captain");
    expect(membership?.status).toBe("active");
  });

  it("getTeamDashboard returns team summary and member metrics from real DB", async () => {
    await integrationDb.team.create({
      data: {
        id: "44444444-4444-4444-4444-444444444444",
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: captainId
      }
    });

    await integrationDb.user.create({
      data: {
        id: "55555555-5555-5555-5555-555555555555",
        email: "member@example.com",
        display_name: "Member",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    await integrationDb.teamMember.createMany({
      data: [
        {
          team_id: "44444444-4444-4444-4444-444444444444",
          user_id: captainId,
          role: "captain",
          status: "active",
          attendance_rate: "90",
          current_debt_amount_minor: 0,
          currency_code: "VND",
          joined_at: new Date("2026-04-10T10:00:00.000Z")
        },
        {
          team_id: "44444444-4444-4444-4444-444444444444",
          user_id: "55555555-5555-5555-5555-555555555555",
          role: "member",
          status: "active",
          attendance_rate: "60",
          current_debt_amount_minor: 200000,
          currency_code: "VND",
          joined_at: new Date("2026-04-10T11:00:00.000Z")
        }
      ]
    });

    const { getTeamDashboard } = await import("./service");
    const dashboard = await getTeamDashboard("44444444-4444-4444-4444-444444444444", captainId);

    expect(dashboard.team_summary).toEqual(
      expect.objectContaining({
        id: "44444444-4444-4444-4444-444444444444",
        name: "FC Dashboard",
        short_code: "VP-DASH001",
        member_count: 2,
        role_of_current_user: "captain"
      })
    );
    expect(dashboard.member_summary.active_members).toBe(2);
    expect(dashboard.member_summary.average_attendance_rate).toBe(75);
    expect(dashboard.members).toHaveLength(2);
  });
});
