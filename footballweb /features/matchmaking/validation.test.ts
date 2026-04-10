import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/http";

import { parseCreateMatchPostInput, parseDateOnly, parseTimeOnly } from "./validation";

describe("matchmaking validation", () => {
  it("parses valid match post input", () => {
    const result = parseCreateMatchPostInput({
      team_id: "team-1",
      title: "  Kèo tối thứ 7 ",
      match_type: "friendly",
      urgency: "normal",
      date: "2026-04-10",
      start_time: "19:30",
      end_time: "21:00",
      city_code: " HCM ",
      district_code: " Q7 ",
      venue_name: "Sân Đại Nam",
      field_type: "seven",
      team_skill_min: "L2_RECREATIONAL",
      team_skill_max: "L4_ADVANCED",
      pitch_fee_rule: "share"
    });

    expect(result).toMatchObject({
      team_id: "team-1",
      title: "Kèo tối thứ 7",
      city_code: "HCM",
      district_code: "Q7",
      field_type: "seven",
      pitch_fee_rule: "share",
      timezone: "Asia/Ho_Chi_Minh",
      country_code: "VN"
    });
  });

  it("throws when team is missing", () => {
    expect(() =>
      parseCreateMatchPostInput({
        team_id: "",
        match_type: "friendly",
        urgency: "normal",
        date: "2026-04-10",
        start_time: "19:30",
        field_type: "seven",
        team_skill_min: "L2_RECREATIONAL",
        team_skill_max: "L4_ADVANCED",
        pitch_fee_rule: "share"
      })
    ).toThrowError(ApiError);
  });

  it("parses valid date and time helpers", () => {
    expect(parseDateOnly("2026-04-10").toISOString()).toContain("2026-04-10");
    expect(parseTimeOnly("19:30", "Start time").toISOString()).toContain("T19:30:00.000Z");
  });

  it("throws on invalid time", () => {
    expect(() => parseTimeOnly("", "Start time")).toThrowError(ApiError);
  });
});
