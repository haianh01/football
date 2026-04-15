import { beforeEach, describe, expect, it } from "vitest";

import { integrationDb } from "@/test/integration/prisma";
import { ApiError } from "@/lib/http";

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
    expect(dashboard.action_center.pending_confirmations).toBe(0);
    expect(dashboard.action_center.upcoming_match_shortage).toBe(0);
    expect(dashboard.pending_match_invitations).toEqual([]);
  });

  it("getTeamDashboard includes pending match invitations for captain", async () => {
    const teamId = "44444444-4444-4444-4444-444444444444";
    const challengerId = "88888888-8888-8888-8888-888888888888";
    const challengerTeamId = "99999999-9999-9999-9999-999999999999";

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
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

    await integrationDb.user.create({
      data: {
        id: challengerId,
        email: "challenger@example.com",
        display_name: "Challenger",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    await integrationDb.team.create({
      data: {
        id: challengerTeamId,
        name: "FC Challenger",
        slug: "fc-challenger",
        short_code: "VP-CHALL01",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    const { createMatchInvitation, createMatchPost } = await import("@/features/matchmaking/service");
    const { getTeamDashboard } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo dashboard pending",
        match_type: "friendly",
        urgency: "normal",
        date: "2026-04-12",
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

    await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId
      },
      challengerId
    );

    const dashboard = await getTeamDashboard(teamId, captainId);

    expect(dashboard.action_center.pending_confirmations).toBe(1);
    expect(dashboard.action_center.upcoming_match_shortage).toBe(0);
    expect(dashboard.pending_match_invitations).toHaveLength(1);
    expect(dashboard.pending_match_invitations[0]).toEqual(
      expect.objectContaining({
        inviter_team: expect.objectContaining({
          id: challengerTeamId,
          name: "FC Challenger"
        }),
        match_post: expect.objectContaining({
          id: post.id,
          title: "Kèo dashboard pending"
        })
      })
    );
  });

  it("getTeamDashboard includes upcoming matched fixtures for captain", async () => {
    const teamId = "44444444-4444-4444-4444-444444444444";
    const challengerId = "88888888-8888-8888-8888-888888888888";
    const challengerTeamId = "99999999-9999-9999-9999-999999999999";

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
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

    await integrationDb.user.create({
      data: {
        id: challengerId,
        email: "challenger@example.com",
        display_name: "Challenger",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    await integrationDb.team.create({
      data: {
        id: challengerTeamId,
        name: "FC Challenger",
        slug: "fc-challenger",
        short_code: "VP-CHALL01",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    const { acceptMatchInvitation, createMatchInvitation, createMatchPost } = await import("@/features/matchmaking/service");
    const { getTeamDashboard } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo dashboard upcoming",
        match_type: "friendly",
        urgency: "normal",
        date: "2099-04-18",
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

    const invitation = await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId
      },
      challengerId
    );

    await acceptMatchInvitation(invitation.id, captainId);

    const dashboard = await getTeamDashboard(teamId, captainId);

    expect(dashboard.upcoming_matches).toHaveLength(1);
    expect(dashboard.upcoming_matches[0]).toEqual(
      expect.objectContaining({
        source_match_post_id: post.id,
        status: "scheduled",
        current_team_available_count: 1,
        current_team_required_players: 7,
        current_team_shortage: 6,
        home_team: expect.objectContaining({
          id: teamId,
          name: "FC Dashboard"
        }),
        away_team: expect.objectContaining({
          id: challengerTeamId,
          name: "FC Challenger"
        })
      })
    );
    expect(dashboard.action_center.upcoming_match_shortage).toBe(6);
  });

  it("updateTeam persists editable team fields", async () => {
    const teamId = "44444444-4444-4444-4444-444444444444";

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
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

    const { updateTeam } = await import("./service");
    const updatedTeam = await updateTeam(teamId, captainId, {
      name: "FC Dashboard Updated",
      description: "Đội đá tối thứ 5",
      home_city_code: "HN",
      home_district_code: "CauGiay",
      skill_level_code: "L4_ADVANCED",
      play_style_code: "pressing",
      primary_color: "#123456",
      secondary_color: "#abcdef"
    });

    const persistedTeam = await integrationDb.team.findUniqueOrThrow({
      where: {
        id: teamId
      }
    });

    expect(updatedTeam).toEqual(
      expect.objectContaining({
        id: teamId,
        name: "FC Dashboard Updated",
        description: "Đội đá tối thứ 5",
        home_city_code: "HN",
        home_district_code: "CauGiay",
        skill_level_code: "L4_ADVANCED",
        play_style_code: "pressing",
        primary_color: "#123456",
        secondary_color: "#abcdef"
      })
    );
    expect(persistedTeam.name).toBe("FC Dashboard Updated");
    expect(persistedTeam.description).toBe("Đội đá tối thứ 5");
    expect(persistedTeam.home_city_code).toBe("HN");
    expect(persistedTeam.skill_level_code).toBe("L4_ADVANCED");
  });

  it("captain can change member role and remove a member", async () => {
    const teamId = "44444444-4444-4444-4444-444444444444";
    const memberUserId = "66666666-6666-6666-6666-666666666666";

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: captainId
      }
    });

    await integrationDb.user.create({
      data: {
        id: memberUserId,
        email: "member-ops@example.com",
        display_name: "Member Ops",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
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

    const memberRecord = await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: memberUserId,
        role: "member",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    const { updateTeamMember } = await import("./service");
    const promoted = await updateTeamMember(teamId, memberRecord.id, captainId, {
      role: "treasurer"
    });
    const removed = await updateTeamMember(teamId, memberRecord.id, captainId, {
      status: "removed"
    });

    expect(promoted).toEqual(
      expect.objectContaining({
        id: memberRecord.id,
        role: "treasurer",
        status: "active"
      })
    );
    expect(removed).toEqual(
      expect.objectContaining({
        id: memberRecord.id,
        role: "treasurer",
        status: "removed"
      })
    );
  });

  it("member can leave team but last captain cannot leave without another captain", async () => {
    const teamId = "44444444-4444-4444-4444-444444444444";
    const memberUserId = "77777777-7777-7777-7777-777777777777";

    await integrationDb.team.create({
      data: {
        id: teamId,
        name: "FC Dashboard",
        slug: "fc-dashboard",
        short_code: "VP-DASH001",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: captainId
      }
    });

    const captainMembership = await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: captainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T10:00:00.000Z")
      }
    });

    await integrationDb.user.create({
      data: {
        id: memberUserId,
        email: "member-leave@example.com",
        display_name: "Member Leave",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    const memberRecord = await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: memberUserId,
        role: "member",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    const { updateTeamMember } = await import("./service");
    const leftTeam = await updateTeamMember(teamId, memberRecord.id, memberUserId, {
      status: "inactive"
    });

    expect(leftTeam).toEqual(
      expect.objectContaining({
        id: memberRecord.id,
        status: "inactive"
      })
    );

    await expect(
      updateTeamMember(teamId, captainMembership.id, captainId, {
        status: "inactive"
      })
    ).rejects.toBeInstanceOf(ApiError);
  });
});
