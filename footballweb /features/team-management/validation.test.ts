import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/http";

import { parseCreateTeamInput } from "./validation";

describe("parseCreateTeamInput", () => {
  it("parses valid input and trims values", () => {
    const result = parseCreateTeamInput({
      name: "  FC Warriors  ",
      skill_level_code: "L3_INTERMEDIATE",
      home_city_code: "  HCM ",
      default_locale: ""
    });

    expect(result).toEqual({
      name: "FC Warriors",
      slug: undefined,
      logo_url: undefined,
      description: undefined,
      home_country_code: "VN",
      home_city_code: "HCM",
      home_district_code: undefined,
      default_locale: "vi-VN",
      skill_level_code: "L3_INTERMEDIATE",
      play_style_code: undefined,
      primary_color: undefined,
      secondary_color: undefined
    });
  });

  it("throws when team name is missing", () => {
    expect(() =>
      parseCreateTeamInput({
        name: " ",
        skill_level_code: "L3_INTERMEDIATE"
      })
    ).toThrowError(ApiError);
  });

  it("throws when skill level is invalid", () => {
    expect(() =>
      parseCreateTeamInput({
        name: "FC Warriors",
        skill_level_code: "PRO"
      })
    ).toThrowError(ApiError);
  });
});
