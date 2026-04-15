import { beforeEach, describe, expect, it } from "vitest";

import { integrationDb } from "@/test/integration/prisma";

describe("matchmaking service integration", () => {
  const captainId = "22222222-2222-2222-2222-222222222222";
  const teamId = "33333333-3333-3333-3333-333333333333";
  const challengerCaptainId = "66666666-6666-6666-6666-666666666666";
  const challengerTeamId = "77777777-7777-7777-7777-777777777777";

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

  it("createMatchInvitation and acceptMatchInvitation sync match post status and create match", async () => {
    await integrationDb.user.create({
      data: {
        id: challengerCaptainId,
        email: "challenger@example.com",
        display_name: "Challenger Captain",
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
        short_code: "VP-TEAM002",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerCaptainId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerCaptainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T12:00:00.000Z")
      }
    });

    const { acceptMatchInvitation, createMatchInvitation, createMatchPost, getMatchDetail } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo có lời mời",
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

    const invitation = await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId,
        note: "Đội mình sẵn khung giờ này."
      },
      challengerCaptainId
    );

    const postAfterInvitation = await integrationDb.matchPost.findUnique({
      where: {
        id: post.id
      }
    });

    expect(invitation.status).toBe("pending");
    expect(postAfterInvitation?.status).toBe("pending_confirmation");

    const acceptedInvitation = await acceptMatchInvitation(invitation.id, captainId);

    const postAfterAcceptance = await integrationDb.matchPost.findUnique({
      where: {
        id: post.id
      }
    });
    const persistedMatch = await integrationDb.match.findUnique({
      where: {
        source_match_post_id: post.id
      }
    });
    const persistedParticipants = await integrationDb.matchParticipant.findMany({
      where: {
        match_id: persistedMatch!.id
      },
      orderBy: [{ user_id: "asc" }]
    });

    expect(acceptedInvitation.status).toBe("accepted");
    expect(postAfterAcceptance?.status).toBe("matched");
    expect(persistedMatch).toBeTruthy();
    expect(persistedMatch?.home_team_id).toBe(teamId);
    expect(persistedMatch?.away_team_id).toBe(challengerTeamId);
    expect(persistedParticipants).toHaveLength(2);
    expect(persistedParticipants.map((participant) => participant.attendance_status)).toEqual(["invited", "invited"]);

    const matchDetail = await getMatchDetail(persistedMatch!.id, captainId);
    expect(matchDetail).toEqual(
      expect.objectContaining({
        id: persistedMatch?.id,
        source_match_post_id: post.id,
        status: "scheduled",
        home_team: expect.objectContaining({
          id: teamId
        }),
        away_team: expect.objectContaining({
          id: challengerTeamId
        }),
        participant_summary: {
          confirmed_count: 0,
          pending_count: 2
        }
      })
    );
  });

  it("captain can manage same-team participant attendance including checked-in and absent", async () => {
    const teammateId = "99999999-9999-9999-9999-999999999999";

    await integrationDb.user.create({
      data: {
        id: teammateId,
        email: "teammate@example.com",
        display_name: "Teammate",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: teammateId,
        role: "member",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    await integrationDb.user.create({
      data: {
        id: challengerCaptainId,
        email: "challenger@example.com",
        display_name: "Challenger Captain",
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
        short_code: "VP-TEAM002",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerCaptainId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerCaptainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T12:00:00.000Z")
      }
    });

    const { acceptMatchInvitation, createMatchInvitation, createMatchPost, updateMatchParticipantAttendance } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo quản lý attendance",
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

    const invitation = await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId
      },
      challengerCaptainId
    );

    await acceptMatchInvitation(invitation.id, captainId);

    const persistedMatch = await integrationDb.match.findUniqueOrThrow({
      where: {
        source_match_post_id: post.id
      }
    });
    const teammateParticipant = await integrationDb.matchParticipant.findFirstOrThrow({
      where: {
        match_id: persistedMatch.id,
        user_id: teammateId
      }
    });

    const checkedIn = await updateMatchParticipantAttendance(persistedMatch.id, teammateParticipant.id, "checked_in", captainId);
    expect(checkedIn.attendance_status).toBe("checked_in");

    const absent = await updateMatchParticipantAttendance(persistedMatch.id, teammateParticipant.id, "absent", captainId);
    expect(absent.attendance_status).toBe("absent");
  });

  it("captain can update same-team participant goals, assists and mvp flag", async () => {
    const teammateId = "99999999-9999-9999-9999-999999999999";

    await integrationDb.user.create({
      data: {
        id: teammateId,
        email: "teammate@example.com",
        display_name: "Teammate",
        country_code: "VN",
        timezone: "Asia/Ho_Chi_Minh",
        preferred_locale: "vi-VN"
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: teamId,
        user_id: teammateId,
        role: "member",
        status: "active",
        joined_at: new Date("2026-04-10T11:00:00.000Z")
      }
    });

    await integrationDb.user.create({
      data: {
        id: challengerCaptainId,
        email: "challenger@example.com",
        display_name: "Challenger Captain",
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
        short_code: "VP-TEAM002",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerCaptainId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerCaptainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T12:00:00.000Z")
      }
    });

    const { acceptMatchInvitation, createMatchInvitation, createMatchPost, updateMatchParticipantStats } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo nhập stats cầu thủ",
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

    const invitation = await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId
      },
      challengerCaptainId
    );

    await acceptMatchInvitation(invitation.id, captainId);

    const persistedMatch = await integrationDb.match.findUniqueOrThrow({
      where: {
        source_match_post_id: post.id
      }
    });
    const teammateParticipant = await integrationDb.matchParticipant.findFirstOrThrow({
      where: {
        match_id: persistedMatch.id,
        user_id: teammateId
      }
    });

    const updatedParticipant = await updateMatchParticipantStats(
      persistedMatch.id,
      teammateParticipant.id,
      {
        goals: 2,
        assists: 1,
        is_mvp: true
      },
      captainId
    );

    expect(updatedParticipant).toEqual(
      expect.objectContaining({
        id: teammateParticipant.id,
        goals: 2,
        assists: 1,
        is_mvp: true
      })
    );

    const persistedParticipant = await integrationDb.matchParticipant.findUniqueOrThrow({
      where: {
        id: teammateParticipant.id
      }
    });

    expect(persistedParticipant.goals).toBe(2);
    expect(persistedParticipant.assists).toBe(1);
    expect(persistedParticipant.is_mvp).toBe(true);
  });

  it("captain can update match fixture details and complete the match with a score", async () => {
    await integrationDb.user.create({
      data: {
        id: challengerCaptainId,
        email: "challenger@example.com",
        display_name: "Challenger Captain",
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
        short_code: "VP-TEAM002",
        skill_level_code: "L3_INTERMEDIATE",
        created_by: challengerCaptainId
      }
    });

    await integrationDb.teamMember.create({
      data: {
        team_id: challengerTeamId,
        user_id: challengerCaptainId,
        role: "captain",
        status: "active",
        joined_at: new Date("2026-04-10T12:00:00.000Z")
      }
    });

    const { acceptMatchInvitation, createMatchInvitation, createMatchPost, updateMatch } = await import("./service");

    const post = await createMatchPost(
      {
        team_id: teamId,
        title: "Kèo update match lifecycle",
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

    const invitation = await createMatchInvitation(
      {
        match_post_id: post.id,
        inviter_team_id: challengerTeamId
      },
      challengerCaptainId
    );

    await acceptMatchInvitation(invitation.id, captainId);

    const persistedMatch = await integrationDb.match.findUniqueOrThrow({
      where: {
        source_match_post_id: post.id
      }
    });

    const confirmed = await updateMatch(persistedMatch.id, captainId, {
      status: "confirmed",
      date: "2026-04-13",
      start_time: "20:00",
      end_time: "21:30",
      venue_name: "Sân Mỹ Đình 2",
      district_code: "MY_DINH"
    });

    expect(confirmed).toEqual(
      expect.objectContaining({
        id: persistedMatch.id,
        status: "confirmed",
        date: "2026-04-13",
        start_time: "20:00",
        end_time: "21:30",
        venue_name: "Sân Mỹ Đình 2",
        district_code: "MY_DINH",
        home_score: null,
        away_score: null
      })
    );

    const completed = await updateMatch(persistedMatch.id, captainId, {
      status: "completed",
      home_score: 3,
      away_score: 2,
      result_note: "Đội nhà thắng sát nút."
    });

    expect(completed).toEqual(
      expect.objectContaining({
        id: persistedMatch.id,
        status: "completed",
        home_score: 3,
        away_score: 2,
        result_note: "Đội nhà thắng sát nút."
      })
    );
    expect(completed.completed_at).not.toBeNull();

    const matchAfterCompletion = await integrationDb.match.findUniqueOrThrow({
      where: {
        id: persistedMatch.id
      }
    });

    expect(matchAfterCompletion.status).toBe("completed");
    expect(matchAfterCompletion.home_score).toBe(3);
    expect(matchAfterCompletion.away_score).toBe(2);
    expect(matchAfterCompletion.completed_at).not.toBeNull();
  });
});
