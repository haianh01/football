import { MatchPostStatus } from "@prisma/client";

import { ApiError } from "@/lib/http";

const SKILL_LEVELS = new Set([
  "L1_CASUAL",
  "L2_RECREATIONAL",
  "L3_INTERMEDIATE",
  "L4_ADVANCED",
  "L5_COMPETITIVE"
] as const);

const FIELD_TYPES = new Set(["five", "seven", "eleven"] as const);
const MATCH_TYPES = new Set(["friendly", "tactical", "mini_tournament"] as const);
const PITCH_FEE_RULES = new Set(["share", "home_team_pays", "away_team_pays", "sponsor_supported"] as const);
const URGENCY_LEVELS = new Set(["low", "normal", "high"] as const);

export type CreateMatchPostInput = {
  team_id: string;
  title?: string;
  match_type: "friendly" | "tactical" | "mini_tournament";
  urgency: "low" | "normal" | "high";
  date: string;
  start_time: string;
  end_time?: string;
  timezone?: string;
  country_code?: string;
  city_code?: string;
  district_code?: string;
  venue_name?: string;
  venue_address?: string;
  field_type: "five" | "seven" | "eleven";
  team_skill_min: "L1_CASUAL" | "L2_RECREATIONAL" | "L3_INTERMEDIATE" | "L4_ADVANCED" | "L5_COMPETITIVE";
  team_skill_max: "L1_CASUAL" | "L2_RECREATIONAL" | "L3_INTERMEDIATE" | "L4_ADVANCED" | "L5_COMPETITIVE";
  pitch_fee_rule: "share" | "home_team_pays" | "away_team_pays" | "sponsor_supported";
  support_note?: string;
  note?: string;
};

export type MatchPostListFilters = {
  q?: string;
  city_code?: string;
  field_type?: "five" | "seven" | "eleven";
  status?: MatchPostStatus;
};

function sanitizeString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function parseDateOnly(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new ApiError(400, "VALIDATION_ERROR", "Match date is required.");
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "VALIDATION_ERROR", "Match date is invalid.");
  }

  return parsed;
}

export function parseTimeOnly(value: string, fieldLabel: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} is required.`);
  }

  const parsed = new Date(`1970-01-01T${trimmed}:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} is invalid.`);
  }

  return parsed;
}

export function parseCreateMatchPostInput(source: FormData | Record<string, unknown>): CreateMatchPostInput {
  const getValue = (key: string) =>
    source instanceof FormData ? source.get(key) : (source[key] as string | undefined);

  const team_id = sanitizeString(getValue("team_id"));
  const match_type = sanitizeString(getValue("match_type")) as CreateMatchPostInput["match_type"];
  const urgency = sanitizeString(getValue("urgency")) as CreateMatchPostInput["urgency"];
  const field_type = sanitizeString(getValue("field_type")) as CreateMatchPostInput["field_type"];
  const team_skill_min = sanitizeString(getValue("team_skill_min")) as CreateMatchPostInput["team_skill_min"];
  const team_skill_max = sanitizeString(getValue("team_skill_max")) as CreateMatchPostInput["team_skill_max"];
  const pitch_fee_rule = sanitizeString(getValue("pitch_fee_rule")) as CreateMatchPostInput["pitch_fee_rule"];
  const date = sanitizeString(getValue("date"));
  const start_time = sanitizeString(getValue("start_time"));

  if (!team_id) {
    throw new ApiError(400, "VALIDATION_ERROR", "Team is required.");
  }

  if (!MATCH_TYPES.has(match_type)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Match type is invalid.");
  }

  if (!URGENCY_LEVELS.has(urgency)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Urgency is invalid.");
  }

  if (!FIELD_TYPES.has(field_type)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Field type is invalid.");
  }

  if (!SKILL_LEVELS.has(team_skill_min)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Minimum skill level is invalid.");
  }

  if (!SKILL_LEVELS.has(team_skill_max)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Maximum skill level is invalid.");
  }

  if (!PITCH_FEE_RULES.has(pitch_fee_rule)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Pitch fee rule is invalid.");
  }

  return {
    team_id,
    title: sanitizeString(getValue("title")) || undefined,
    match_type,
    urgency,
    date,
    start_time,
    end_time: sanitizeString(getValue("end_time")) || undefined,
    timezone: sanitizeString(getValue("timezone")) || "Asia/Ho_Chi_Minh",
    country_code: sanitizeString(getValue("country_code")) || "VN",
    city_code: sanitizeString(getValue("city_code")) || undefined,
    district_code: sanitizeString(getValue("district_code")) || undefined,
    venue_name: sanitizeString(getValue("venue_name")) || undefined,
    venue_address: sanitizeString(getValue("venue_address")) || undefined,
    field_type,
    team_skill_min,
    team_skill_max,
    pitch_fee_rule,
    support_note: sanitizeString(getValue("support_note")) || undefined,
    note: sanitizeString(getValue("note")) || undefined
  };
}
