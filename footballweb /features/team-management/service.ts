import { TeamMemberStatus, TeamRole } from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { slugify } from "@/lib/slug";

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

export async function listTeamsForUser(userId: string) {
  const memberships = await db.teamMember.findMany({
    where: {
      user_id: userId
    },
    include: {
      team: {
        include: {
          _count: {
            select: {
              team_members: true
            }
          }
        }
      }
    },
    orderBy: [{ joined_at: "desc" }]
  });

  return memberships.map((membership) => ({
    id: membership.team.id,
    name: membership.team.name,
    slug: membership.team.slug,
    short_code: membership.team.short_code,
    logo_url: membership.team.logo_url,
    skill_level_code: membership.team.skill_level_code,
    member_count: membership.team._count.team_members,
    role_of_current_user: membership.role
  }));
}

async function createUniqueSlug(baseInput: string) {
  const base = slugify(baseInput) || `team-${crypto.randomUUID().slice(0, 8)}`;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await db.team.findUnique({
      where: {
        slug: candidate
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError(409, "CONFLICT", "Unable to generate a unique team slug.");
}

async function createUniqueShortCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `VP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const existing = await db.team.findUnique({
      where: {
        short_code: candidate
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError(409, "CONFLICT", "Unable to generate a unique team code.");
}

export async function createTeam(input: CreateTeamInput, createdByUserId: string) {
  const slug = await createUniqueSlug(input.slug || input.name);
  const shortCode = await createUniqueShortCode();
  const now = new Date();

  const team = await db.$transaction(async (tx) => {
    const createdTeam = await tx.team.create({
      data: {
        name: input.name,
        slug,
        short_code: shortCode,
        logo_url: input.logo_url,
        description: input.description,
        home_country_code: input.home_country_code ?? "VN",
        home_city_code: input.home_city_code,
        home_district_code: input.home_district_code,
        default_locale: input.default_locale ?? "vi-VN",
        skill_level_code: input.skill_level_code,
        play_style_code: input.play_style_code,
        primary_color: input.primary_color,
        secondary_color: input.secondary_color,
        created_by: createdByUserId
      }
    });

    await tx.teamMember.create({
      data: {
        team_id: createdTeam.id,
        user_id: createdByUserId,
        role: TeamRole.captain,
        status: TeamMemberStatus.active,
        joined_at: now
      }
    });

    return createdTeam;
  });

  return team;
}

export async function getTeamMembership(teamId: string, userId: string) {
  return db.teamMember.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId
      }
    }
  });
}

export async function getTeamDetail(teamId: string, currentUserId?: string) {
  const team = await db.team.findUnique({
    where: {
      id: teamId
    },
    include: {
      _count: {
        select: {
          team_members: true
        }
      }
    }
  });

  if (!team) {
    throw new ApiError(404, "NOT_FOUND", "Team not found.");
  }

  const membership = currentUserId ? await getTeamMembership(teamId, currentUserId) : null;

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    short_code: team.short_code,
    logo_url: team.logo_url,
    description: team.description,
    skill_level_code: team.skill_level_code,
    default_locale: team.default_locale,
    member_count: team._count.team_members,
    role_of_current_user: membership?.role ?? null,
    reputation: {
      score: 0,
      reliability_score: 0,
      punctuality_score: 0,
      total_verified_matches: 0
    }
  };
}

export async function getTeamDashboard(teamId: string, currentUserId: string) {
  const membership = await getTeamMembership(teamId, currentUserId);

  if (!membership) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this team.");
  }

  const [teamDetail, members] = await Promise.all([
    getTeamDetail(teamId, currentUserId),
    db.teamMember.findMany({
      where: {
        team_id: teamId
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true
          }
        }
      },
      orderBy: [{ role: "asc" }, { joined_at: "asc" }]
    })
  ]);

  const activeMembers = members.filter((member) => member.status === TeamMemberStatus.active);
  const averageAttendanceRate =
    activeMembers.length === 0
      ? 0
      : activeMembers.reduce((sum, member) => sum + Number(member.attendance_rate), 0) / activeMembers.length;

  return {
    team_summary: {
      id: teamDetail.id,
      name: teamDetail.name,
      short_code: teamDetail.short_code,
      logo_url: teamDetail.logo_url,
      skill_level_code: teamDetail.skill_level_code,
      member_count: teamDetail.member_count,
      role_of_current_user: teamDetail.role_of_current_user
    },
    action_center: {
      pending_confirmations: 0,
      open_polls: 0,
      overdue_fee_assignees: 0,
      upcoming_match_shortage: 0
    },
    upcoming_matches: [],
    open_polls: [],
    open_fees: [],
    member_summary: {
      active_members: activeMembers.length,
      average_attendance_rate: Number(averageAttendanceRate.toFixed(1))
    },
    members: members.map((member) => ({
      id: member.id,
      user_id: member.user_id,
      display_name: member.user.display_name,
      avatar_url: member.user.avatar_url,
      role: member.role,
      status: member.status,
      attendance_rate: Number(member.attendance_rate),
      current_debt_amount_minor: Number(member.current_debt_amount_minor),
      currency_code: member.currency_code,
      joined_at: member.joined_at.toISOString()
    }))
  };
}
