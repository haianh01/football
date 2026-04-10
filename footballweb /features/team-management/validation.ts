import { ApiError } from "@/lib/http";

export type CreateTeamInput = {
  name: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  home_country_code?: string;
  home_city_code?: string;
  home_district_code?: string;
  default_locale?: string;
  skill_level_code: "L1_CASUAL" | "L2_RECREATIONAL" | "L3_INTERMEDIATE" | "L4_ADVANCED" | "L5_COMPETITIVE";
  play_style_code?: string;
  primary_color?: string;
  secondary_color?: string;
};

const SKILL_LEVELS = new Set<CreateTeamInput["skill_level_code"]>([
  "L1_CASUAL",
  "L2_RECREATIONAL",
  "L3_INTERMEDIATE",
  "L4_ADVANCED",
  "L5_COMPETITIVE"
]);

function sanitizeString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function parseCreateTeamInput(source: FormData | Record<string, unknown>): CreateTeamInput {
  const getValue = (key: string) =>
    source instanceof FormData ? source.get(key) : (source[key] as string | undefined);

  const name = sanitizeString(getValue("name"));
  const skill_level_code = sanitizeString(getValue("skill_level_code")) as CreateTeamInput["skill_level_code"];

  if (!name) {
    throw new ApiError(400, "VALIDATION_ERROR", "Team name is required.");
  }

  if (!skill_level_code) {
    throw new ApiError(400, "VALIDATION_ERROR", "Skill level is required.");
  }

  if (!SKILL_LEVELS.has(skill_level_code)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Skill level code is invalid.");
  }

  return {
    name,
    slug: sanitizeString(getValue("slug")) || undefined,
    logo_url: sanitizeString(getValue("logo_url")) || undefined,
    description: sanitizeString(getValue("description")) || undefined,
    home_country_code: sanitizeString(getValue("home_country_code")) || "VN",
    home_city_code: sanitizeString(getValue("home_city_code")) || undefined,
    home_district_code: sanitizeString(getValue("home_district_code")) || undefined,
    default_locale: sanitizeString(getValue("default_locale")) || "vi-VN",
    skill_level_code,
    play_style_code: sanitizeString(getValue("play_style_code")) || undefined,
    primary_color: sanitizeString(getValue("primary_color")) || undefined,
    secondary_color: sanitizeString(getValue("secondary_color")) || undefined
  };
}
