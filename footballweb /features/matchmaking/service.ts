import { MatchPostStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import {
  CreateMatchPostInput,
  MatchPostListFilters,
  parseCreateMatchPostInput,
  parseDateOnly,
  parseTimeOnly
} from "./validation";

export { parseCreateMatchPostInput, parseDateOnly, parseTimeOnly };
export type { CreateMatchPostInput, MatchPostListFilters };

type MatchPostWithTeam = Prisma.MatchPostGetPayload<{
  include: {
    team: {
      include: {
        _count: {
          select: {
            team_members: true;
          };
        };
      };
    };
  };
}>;


async function requireTeamPostingAccess(teamId: string, userId: string) {
  const membership = await db.teamMember.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId
      }
    },
    select: {
      id: true,
      role: true,
      status: true
    }
  });

  if (!membership || membership.status !== "active") {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to post for this team.");
  }

  return membership;
}

function buildMatchPostSummary(matchPost: MatchPostWithTeam) {
  return {
    id: matchPost.id,
    title: matchPost.title,
    status: matchPost.status,
    urgency: matchPost.urgency,
    match_type: matchPost.match_type,
    date: matchPost.date.toISOString().slice(0, 10),
    start_time: matchPost.start_time.toISOString().slice(11, 16),
    end_time: matchPost.end_time?.toISOString().slice(11, 16) ?? null,
    city_code: matchPost.city_code,
    district_code: matchPost.district_code,
    venue_name: matchPost.venue_name,
    field_type: matchPost.field_type,
    team_skill_min: matchPost.team_skill_min,
    team_skill_max: matchPost.team_skill_max,
    pitch_fee_rule: matchPost.pitch_fee_rule,
    support_note: matchPost.support_note,
    team: {
      id: matchPost.team.id,
      name: matchPost.team.name,
      slug: matchPost.team.slug,
      short_code: matchPost.team.short_code,
      logo_url: matchPost.team.logo_url,
      skill_level_code: matchPost.team.skill_level_code,
      member_count: matchPost.team._count?.team_members ?? 0
    },
    trust_metrics: {
      reputation_score: null,
      reliability_score: null,
      punctuality_score: null,
      total_verified_matches: null,
      note: "Trust metrics sẽ được nối khi module reputation được bật."
    }
  };
}

export async function listMatchPosts(filters: MatchPostListFilters = {}) {
  const where: Prisma.MatchPostWhereInput = {
    status: filters.status ?? "open"
  };

  if (filters.city_code) {
    where.city_code = filters.city_code;
  }

  if (filters.field_type) {
    where.field_type = filters.field_type;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { venue_name: { contains: filters.q, mode: "insensitive" } },
      { city_code: { contains: filters.q, mode: "insensitive" } },
      { district_code: { contains: filters.q, mode: "insensitive" } },
      { team: { name: { contains: filters.q, mode: "insensitive" } } }
    ];
  }

  const matchPosts = await db.matchPost.findMany({
    where,
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
    orderBy: [{ date: "asc" }, { start_time: "asc" }, { created_at: "desc" }]
  });

  return matchPosts.map((matchPost) => buildMatchPostSummary(matchPost));
}

export async function getMatchPostDetail(matchPostId: string) {
  const matchPost = await db.matchPost.findUnique({
    where: {
      id: matchPostId
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
    }
  });

  if (!matchPost) {
    throw new ApiError(404, "NOT_FOUND", "Match post not found.");
  }

  return {
    ...buildMatchPostSummary(matchPost),
    timezone: matchPost.timezone,
    country_code: matchPost.country_code,
    venue_address: matchPost.venue_address,
    note: matchPost.note,
    expires_at: matchPost.expires_at?.toISOString() ?? null,
    created_at: matchPost.created_at.toISOString(),
    team: {
      id: matchPost.team.id,
      name: matchPost.team.name,
      slug: matchPost.team.slug,
      short_code: matchPost.team.short_code,
      logo_url: matchPost.team.logo_url,
      skill_level_code: matchPost.team.skill_level_code,
      member_count: matchPost.team._count.team_members,
      description: matchPost.team.description,
      home_city_code: matchPost.team.home_city_code,
      home_district_code: matchPost.team.home_district_code
    }
  };
}

export async function createMatchPost(input: CreateMatchPostInput, createdByUserId: string) {
  await requireTeamPostingAccess(input.team_id, createdByUserId);

  const date = parseDateOnly(input.date);
  const startTime = parseTimeOnly(input.start_time, "Start time");
  const endTime = input.end_time ? parseTimeOnly(input.end_time, "End time") : undefined;

  if (endTime && endTime <= startTime) {
    throw new ApiError(400, "VALIDATION_ERROR", "End time must be later than start time.");
  }

  const matchPost = await db.matchPost.create({
    data: {
      team_id: input.team_id,
      title: input.title,
      match_type: input.match_type,
      urgency: input.urgency,
      date,
      start_time: startTime,
      end_time: endTime,
      timezone: input.timezone ?? "Asia/Ho_Chi_Minh",
      country_code: input.country_code ?? "VN",
      city_code: input.city_code,
      district_code: input.district_code,
      venue_name: input.venue_name,
      venue_address: input.venue_address,
      field_type: input.field_type,
      team_skill_min: input.team_skill_min,
      team_skill_max: input.team_skill_max,
      pitch_fee_rule: input.pitch_fee_rule,
      support_note: input.support_note,
      note: input.note,
      created_by: createdByUserId
    }
  });

  return getMatchPostDetail(matchPost.id);
}
