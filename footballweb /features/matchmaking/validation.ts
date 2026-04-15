import { MatchPostStatus, MatchStatus } from "@prisma/client";

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
const MATCH_STATUSES = new Set<NonNullable<UpdateMatchInput["status"]>>([
  MatchStatus.scheduled,
  MatchStatus.confirmed,
  MatchStatus.completed,
  MatchStatus.cancelled
]);

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

export type UpdateMatchInput = {
  status?: "scheduled" | "confirmed" | "completed" | "cancelled";
  date?: string;
  start_time?: string;
  end_time?: string | null;
  timezone?: string;
  city_code?: string | null;
  district_code?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  field_type?: "five" | "seven" | "eleven";
  home_score?: number | null;
  away_score?: number | null;
  result_note?: string | null;
};

export type UpdateMatchParticipantStatsInput = {
  goals?: number;
  assists?: number;
  is_mvp?: boolean;
};

function sanitizeString(value: FormDataEntryValue | string | number | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function hasKey(source: FormData | Record<string, unknown>, key: string) {
  return source instanceof FormData ? source.has(key) : Object.prototype.hasOwnProperty.call(source, key);
}

function parseOptionalScore(value: FormDataEntryValue | string | number | null | undefined, fieldLabel: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} must be a non-negative integer.`);
  }

  return normalized;
}

function parseNonNegativeInteger(value: FormDataEntryValue | string | number | null | undefined, fieldLabel: string) {
  if (value === null || value === undefined || value === "") {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} is required.`);
  }

  const normalized = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} must be a non-negative integer.`);
  }

  return normalized;
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

export function parseUpdateMatchInput(source: FormData | Record<string, unknown>): UpdateMatchInput {
  const getValue = (key: string) =>
    source instanceof FormData
      ? source.get(key)
      : ((source[key] as string | number | null | undefined) ?? undefined);

  const input: UpdateMatchInput = {};

  if (hasKey(source, "status")) {
    const status = sanitizeString(getValue("status")) as NonNullable<UpdateMatchInput["status"]>;

    if (!MATCH_STATUSES.has(status)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Match status is invalid.");
    }

    input.status = status;
  }

  if (hasKey(source, "date")) {
    const date = sanitizeString(getValue("date"));

    if (!date) {
      throw new ApiError(400, "VALIDATION_ERROR", "Match date cannot be empty.");
    }

    input.date = date;
  }

  if (hasKey(source, "start_time")) {
    const startTime = sanitizeString(getValue("start_time"));

    if (!startTime) {
      throw new ApiError(400, "VALIDATION_ERROR", "Start time cannot be empty.");
    }

    input.start_time = startTime;
  }

  if (hasKey(source, "end_time")) {
    input.end_time = sanitizeString(getValue("end_time")) || null;
  }

  if (hasKey(source, "timezone")) {
    const timezone = sanitizeString(getValue("timezone"));

    if (!timezone) {
      throw new ApiError(400, "VALIDATION_ERROR", "Timezone cannot be empty.");
    }

    input.timezone = timezone;
  }

  if (hasKey(source, "city_code")) {
    input.city_code = sanitizeString(getValue("city_code")) || null;
  }

  if (hasKey(source, "district_code")) {
    input.district_code = sanitizeString(getValue("district_code")) || null;
  }

  if (hasKey(source, "venue_name")) {
    input.venue_name = sanitizeString(getValue("venue_name")) || null;
  }

  if (hasKey(source, "venue_address")) {
    input.venue_address = sanitizeString(getValue("venue_address")) || null;
  }

  if (hasKey(source, "field_type")) {
    const fieldType = sanitizeString(getValue("field_type")) as NonNullable<UpdateMatchInput["field_type"]>;

    if (!FIELD_TYPES.has(fieldType)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Field type is invalid.");
    }

    input.field_type = fieldType;
  }

  if (hasKey(source, "home_score")) {
    input.home_score = parseOptionalScore(getValue("home_score"), "Home score");
  }

  if (hasKey(source, "away_score")) {
    input.away_score = parseOptionalScore(getValue("away_score"), "Away score");
  }

  if (hasKey(source, "result_note")) {
    input.result_note = sanitizeString(getValue("result_note")) || null;
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "At least one match field must be provided.");
  }

  return input;
}

export function parseUpdateMatchParticipantStatsInput(
  source: FormData | Record<string, unknown>
): UpdateMatchParticipantStatsInput {
  const getValue = (key: string) =>
    source instanceof FormData
      ? source.get(key)
      : ((source[key] as string | number | boolean | null | undefined) ?? undefined);

  const input: UpdateMatchParticipantStatsInput = {};

  if (hasKey(source, "goals")) {
    const value = getValue("goals");

    if (typeof value === "boolean") {
      throw new ApiError(400, "VALIDATION_ERROR", "Goals must be a non-negative integer.");
    }

    input.goals = parseNonNegativeInteger(value, "Goals");
  }

  if (hasKey(source, "assists")) {
    const value = getValue("assists");

    if (typeof value === "boolean") {
      throw new ApiError(400, "VALIDATION_ERROR", "Assists must be a non-negative integer.");
    }

    input.assists = parseNonNegativeInteger(value, "Assists");
  }

  if (hasKey(source, "is_mvp")) {
    const value = getValue("is_mvp");

    if (typeof value === "boolean") {
      input.is_mvp = value;
    } else {
      const normalized = sanitizeString(value).toLowerCase();

      if (normalized === "true") {
        input.is_mvp = true;
      } else if (normalized === "false") {
        input.is_mvp = false;
      } else {
        throw new ApiError(400, "VALIDATION_ERROR", "is_mvp must be a boolean.");
      }
    }
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "At least one participant stat field must be provided.");
  }

  return input;
}
