import { beforeEach, describe, expect, it } from "vitest";

import { integrationDb } from "@/test/integration/prisma";

describe("matchmaking service integration", () => {
  const captainId = "22222222-2222-2222-2222-222222222222";
  const teamId = "33333333-3333-3333-3333-333333333333";

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

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Integration",
        slug: "fc-integration",
        short_code: "VP-TEAM001",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: captainId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: captainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T10:00:00.000Z")
      }
    });
  });

  it("createMatchPost persists a real match_post row", async () => {
    const { createMatchPost } = await import("./service");

    const result = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo integration test",
        match_type: "friendly",
        urgency: "normal",
        date: "2026-04-10",
        start_time: "19:30",
        end_time: "21:00",
        city_code: "HCM",
        district_code: "Q7",
        venue_name: "Sân Đại Nam",
        field_type: "seven",
        team_skill_min: "L2_RECREATIONAL",
        team_skill_max: "L4_ADVANCED",
        pitch_fee_rule: "share"
      },
      captainId
    );

    const persisted = await integrationDb.matchPost.findUnique({
      where: {
        id: result.id
      }
    });

    expect(persisted).toBeTruthy();
    expect(persisted?.team_id).toBe(teamId);
    expect(persisted?.title).toBe("Kèo integration test");
    expect(result.team.id).toBe(teamId);
  });
});
