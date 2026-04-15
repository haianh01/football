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

export type UpdateTeamInput = {
  name?: string;
  logo_url?: string | null;
  description?: string | null;
  home_city_code?: string | null;
  home_district_code?: string | null;
  skill_level_code?: CreateTeamInput["skill_level_code"];
  play_style_code?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
};

export type UpdateTeamMemberInput = {
  role?: "captain" | "vice_captain" | "treasurer" | "member";
  status?: "active" | "inactive" | "removed";
};

const SKILL_LEVELS = new Set<CreateTeamInput["skill_level_code"]>([
  "L1_CASUAL",
  "L2_RECREATIONAL",
  "L3_INTERMEDIATE",
  "L4_ADVANCED",
  "L5_COMPETITIVE"
]);
const TEAM_MEMBER_ROLES = new Set<NonNullable<UpdateTeamMemberInput["role"]>>([
  "captain",
  "vice_captain",
  "treasurer",
  "member"
]);
const TEAM_MEMBER_MUTABLE_STATUSES = new Set<NonNullable<UpdateTeamMemberInput["status"]>>([
  "active",
  "inactive",
  "removed"
]);

function sanitizeString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function hasKey(source: FormData | Record<string, unknown>, key: string) {
  return source instanceof FormData ? source.has(key) : Object.prototype.hasOwnProperty.call(source, key);
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

export function parseUpdateTeamInput(source: FormData | Record<string, unknown>): UpdateTeamInput {
  const getValue = (key: string) =>
    source instanceof FormData ? source.get(key) : (source[key] as string | undefined);

  const input: UpdateTeamInput = {};

  if (hasKey(source, "name")) {
    const name = sanitizeString(getValue("name"));

    if (!name) {
      throw new ApiError(400, "VALIDATION_ERROR", "Team name cannot be empty.");
    }

    input.name = name;
  }

  if (hasKey(source, "logo_url")) {
    input.logo_url = sanitizeString(getValue("logo_url")) || null;
  }

  if (hasKey(source, "description")) {
    input.description = sanitizeString(getValue("description")) || null;
  }

  if (hasKey(source, "home_city_code")) {
    input.home_city_code = sanitizeString(getValue("home_city_code")) || null;
  }

  if (hasKey(source, "home_district_code")) {
    input.home_district_code = sanitizeString(getValue("home_district_code")) || null;
  }

  if (hasKey(source, "skill_level_code")) {
    const skill_level_code = sanitizeString(getValue("skill_level_code")) as CreateTeamInput["skill_level_code"];

    if (!SKILL_LEVELS.has(skill_level_code)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Skill level code is invalid.");
    }

    input.skill_level_code = skill_level_code;
  }

  if (hasKey(source, "play_style_code")) {
    input.play_style_code = sanitizeString(getValue("play_style_code")) || null;
  }

  if (hasKey(source, "primary_color")) {
    input.primary_color = sanitizeString(getValue("primary_color")) || null;
  }

  if (hasKey(source, "secondary_color")) {
    input.secondary_color = sanitizeString(getValue("secondary_color")) || null;
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "At least one team field must be provided.");
  }

  return input;
}

export function parseUpdateTeamMemberInput(source: FormData | Record<string, unknown>): UpdateTeamMemberInput {
  const getValue = (key: string) =>
    source instanceof FormData ? source.get(key) : (source[key] as string | undefined);

  const input: UpdateTeamMemberInput = {};

  if (hasKey(source, "role")) {
    const role = sanitizeString(getValue("role")) as NonNullable<UpdateTeamMemberInput["role"]>;

    if (!TEAM_MEMBER_ROLES.has(role)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Team member role is invalid.");
    }

    input.role = role;
  }

  if (hasKey(source, "status")) {
    const status = sanitizeString(getValue("status")) as NonNullable<UpdateTeamMemberInput["status"]>;

    if (!TEAM_MEMBER_MUTABLE_STATUSES.has(status)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Team member status is invalid.");
    }

    input.status = status;
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "At least one member field must be provided.");
  }

  return input;
}
