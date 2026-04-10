import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/http";

const dbMock = {
  teamMember: {
    findUnique: vi.fn()
  },
  matchPost: {
    create: vi.fn(),
    findUnique: vi.fn()
  }
};

vi.mock("@/lib/db", () => ({
  db: dbMock
}));

describe("matchmaking/createMatchPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when current user is not an active team member", async () => {
    dbMock.teamMember.findUnique.mockResolvedValue(null);

    const { createMatchPost } = await import("./service");

    await expect(
      createMatchPost(
        {
          team_id: "team-1",
          match_type: "friendly",
          urgency: "normal",
          date: "2026-04-10",
          start_time: "19:30",
          field_type: "seven",
          team_skill_min: "L2_RECREATIONAL",
          team_skill_max: "L4_ADVANCED",
          pitch_fee_rule: "share"
        },
        "user-1"
      )
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("creates match post when user has permission", async () => {
    dbMock.teamMember.findUnique.mockResolvedValue({
      id: "membership-1",
      role: "captain",
      status: "active"
    });

    dbMock.matchPost.create.mockResolvedValue({
      id: "post-1"
    });

    dbMock.matchPost.findUnique.mockResolvedValue({
      id: "post-1",
      title: "Kèo tối thứ 7",
      status: "open",
      urgency: "normal",
      match_type: "friendly",
      date: new Date("2026-04-10T00:00:00.000Z"),
      start_time: new Date("1970-01-01T19:30:00.000Z"),
      end_time: new Date("1970-01-01T21:00:00.000Z"),
      timezone: "Asia/Ho_Chi_Minh",
      country_code: "VN",
      city_code: "HCM",
      district_code: "Q7",
      venue_name: "Sân Đại Nam",
      venue_address: null,
      field_type: "seven",
      team_skill_min: "L2_RECREATIONAL",
      team_skill_max: "L4_ADVANCED",
      pitch_fee_rule: "share",
      support_note: null,
      note: null,
      expires_at: null,
      created_at: new Date("2026-04-01T00:00:00.000Z"),
      team: {
        id: "team-1",
        name: "FC Warriors",
        slug: "fc-warriors",
        short_code: "VP-ABCD1234",
        logo_url: null,
        skill_level_code: "L3_INTERMEDIATE",
        description: null,
        home_city_code: "HCM",
        home_district_code: "Q7",
        _count: {
          team_members: 14
        }
      }
    });

    const { createMatchPost } = await import("./service");

    const result = await createMatchPost(
      {
        team_id: "team-1",
        title: "Kèo tối thứ 7",
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
      "user-1"
    );

    expect(dbMock.matchPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        team_id: "team-1",
        title: "Kèo tối thứ 7",
        created_by: "user-1"
      })
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "post-1",
        team: expect.objectContaining({
          id: "team-1",
          name: "FC Warriors"
        })
      })
    );
  });
});
