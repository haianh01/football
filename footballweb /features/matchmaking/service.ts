import {
  AttendanceStatus,
  MatchInvitationStatus,
  MatchPostStatus,
  MatchStatus,
  ParticipantRole,
  ParticipantSourceType,
  Prisma,
  TeamMemberStatus,
  TeamRole
} from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import {
  CreateMatchPostInput,
  MatchPostListFilters,
  UpdateMatchInput,
  UpdateMatchParticipantStatsInput,
  parseCreateMatchPostInput,
  parseUpdateMatchInput,
  parseUpdateMatchParticipantStatsInput,
  parseDateOnly,
  parseTimeOnly
} from "./validation";

export {
  parseCreateMatchPostInput,
  parseDateOnly,
  parseTimeOnly,
  parseUpdateMatchInput,
  parseUpdateMatchParticipantStatsInput
};
export type {
  CreateMatchPostInput,
  MatchPostListFilters,
  UpdateMatchInput,
  UpdateMatchParticipantStatsInput
};

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

type MatchPostWithTeamAndMatch = Prisma.MatchPostGetPayload<{
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
    scheduled_match: {
      include: {
        home_team: true;
        away_team: true;
        match_participants: {
          select: {
            id: true;
            attendance_status: true;
          };
        };
      };
    };
  };
}>;

type MatchInvitationWithRelations = Prisma.MatchInvitationGetPayload<{
  include: {
    match_post: {
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
    };
    inviter_team: true;
    target_team: true;
  };
}>;

type MatchWithTeams = Prisma.MatchGetPayload<{
  include: {
    home_team: true;
    away_team: true;
    match_participants: {
      select: {
        id: true;
        attendance_status: true;
      };
    };
  };
}>;

type MatchParticipantWithRelations = Prisma.MatchParticipantGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        display_name: true;
        avatar_url: true;
      };
    };
    team: {
      select: {
        id: true;
        name: true;
        short_code: true;
        logo_url: true;
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

async function requireTeamCaptainAccess(teamId: string, userId: string) {
  const membership = await db.teamMember.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId
      }
    },
    select: {
      role: true,
      status: true
    }
  });

  if (!membership || membership.status !== TeamMemberStatus.active || membership.role !== TeamRole.captain) {
    throw new ApiError(403, "FORBIDDEN", "Captain permission is required.");
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

function getParticipantSummary(
  participants: Array<{
    attendance_status: AttendanceStatus;
  }>
) {
  const confirmedStatuses = new Set<AttendanceStatus>([AttendanceStatus.confirmed, AttendanceStatus.checked_in]);
  const pendingStatuses = new Set<AttendanceStatus>([AttendanceStatus.invited]);

  return {
    confirmed_count: participants.filter((participant) => confirmedStatuses.has(participant.attendance_status)).length,
    pending_count: participants.filter((participant) => pendingStatuses.has(participant.attendance_status)).length
  };
}

function buildMatchSummary(match: MatchWithTeams) {
  return {
    id: match.id,
    source_match_post_id: match.source_match_post_id,
    status: match.status,
    match_type: match.match_type,
    home_score: match.home_score,
    away_score: match.away_score,
    result_note: match.result_note,
    completed_at: match.completed_at?.toISOString() ?? null,
    cancelled_at: match.cancelled_at?.toISOString() ?? null,
    date: match.date.toISOString().slice(0, 10),
    start_time: match.start_time.toISOString().slice(11, 16),
    end_time: match.end_time?.toISOString().slice(11, 16) ?? null,
    timezone: match.timezone,
    country_code: match.country_code,
    state_code: match.state_code,
    city_code: match.city_code,
    district_code: match.district_code,
    venue_name: match.venue_name,
    venue_address: match.venue_address,
    field_type: match.field_type,
    currency_code: match.currency_code,
    home_team: match.home_team
      ? {
          id: match.home_team.id,
          name: match.home_team.name,
          short_code: match.home_team.short_code,
          logo_url: match.home_team.logo_url
        }
      : null,
    away_team: match.away_team
      ? {
          id: match.away_team.id,
          name: match.away_team.name,
          short_code: match.away_team.short_code,
          logo_url: match.away_team.logo_url
        }
      : null,
    participant_summary: getParticipantSummary(match.match_participants)
  };
}

function buildMatchParticipantSummary(participant: MatchParticipantWithRelations) {
  return {
    id: participant.id,
    match_id: participant.match_id,
    user_id: participant.user_id,
    team_id: participant.team_id,
    source_type: participant.source_type,
    role: participant.role,
    attendance_status: participant.attendance_status,
    goals: participant.goals,
    assists: participant.assists,
    is_mvp: participant.is_mvp,
    position_code: participant.position_code,
    created_at: participant.created_at.toISOString(),
    updated_at: participant.updated_at.toISOString(),
    user: participant.user,
    team: participant.team
  };
}

function buildMatchInvitationSummary(invitation: MatchInvitationWithRelations) {
  return {
    id: invitation.id,
    status: invitation.status,
    note: invitation.note,
    created_at: invitation.created_at.toISOString(),
    responded_at: invitation.responded_at?.toISOString() ?? null,
    match_post: {
      id: invitation.match_post.id,
      title: invitation.match_post.title,
      status: invitation.match_post.status,
      date: invitation.match_post.date.toISOString().slice(0, 10),
      start_time: invitation.match_post.start_time.toISOString().slice(11, 16),
      venue_name: invitation.match_post.venue_name
    },
    inviter_team: {
      id: invitation.inviter_team.id,
      name: invitation.inviter_team.name,
      short_code: invitation.inviter_team.short_code,
      logo_url: invitation.inviter_team.logo_url
    },
    target_team: {
      id: invitation.target_team.id,
      name: invitation.target_team.name,
      short_code: invitation.target_team.short_code,
      logo_url: invitation.target_team.logo_url
    }
  };
}

async function upsertMatchForAcceptedInvitation(
  tx: Prisma.TransactionClient,
  invitation: MatchInvitationWithRelations,
  createdByUserId: string
) {
  return tx.match.upsert({
    where: {
      source_match_post_id: invitation.match_post_id
    },
    update: {
      home_team_id: invitation.target_team_id,
      away_team_id: invitation.inviter_team_id,
      match_type: invitation.match_post.match_type,
      status: MatchStatus.scheduled,
      date: invitation.match_post.date,
      start_time: invitation.match_post.start_time,
      end_time: invitation.match_post.end_time,
      timezone: invitation.match_post.timezone,
      country_code: invitation.match_post.country_code,
      state_code: invitation.match_post.state_code,
      city_code: invitation.match_post.city_code,
      district_code: invitation.match_post.district_code,
      venue_name: invitation.match_post.venue_name,
      venue_address: invitation.match_post.venue_address,
      field_type: invitation.match_post.field_type,
      currency_code: invitation.match_post.currency_code
    },
    create: {
      source_match_post_id: invitation.match_post_id,
      home_team_id: invitation.target_team_id,
      away_team_id: invitation.inviter_team_id,
      match_type: invitation.match_post.match_type,
      status: MatchStatus.scheduled,
      date: invitation.match_post.date,
      start_time: invitation.match_post.start_time,
      end_time: invitation.match_post.end_time,
      timezone: invitation.match_post.timezone,
      country_code: invitation.match_post.country_code,
      state_code: invitation.match_post.state_code,
      city_code: invitation.match_post.city_code,
      district_code: invitation.match_post.district_code,
      venue_name: invitation.match_post.venue_name,
      venue_address: invitation.match_post.venue_address,
      field_type: invitation.match_post.field_type,
      currency_code: invitation.match_post.currency_code,
      created_by: createdByUserId
    },
    include: {
      home_team: true,
      away_team: true,
      match_participants: {
        select: {
          id: true,
          attendance_status: true
        }
      }
    }
  });
}

async function seedMatchParticipantsForTeams(
  tx: Prisma.TransactionClient,
  matchId: string,
  teamIds: string[]
) {
  const memberships = await tx.teamMember.findMany({
    where: {
      team_id: {
        in: teamIds
      },
      status: TeamMemberStatus.active
    },
    select: {
      team_id: true,
      user_id: true,
      role: true,
      primary_position_code: true
    }
  });

  if (memberships.length === 0) {
    return;
  }

  await tx.matchParticipant.createMany({
    data: memberships.map((membership) => ({
      match_id: matchId,
      user_id: membership.user_id,
      team_id: membership.team_id,
      source_type: ParticipantSourceType.team_member,
      role: membership.role === TeamRole.captain ? ParticipantRole.captain : ParticipantRole.player,
      position_code: membership.primary_position_code
    })),
    skipDuplicates: true
  });
}

async function requireMatchAccess(matchId: string, currentUserId: string) {
  const match = await db.match.findUnique({
    where: {
      id: matchId
    },
    include: {
      home_team: true,
      away_team: true,
      match_participants: {
        select: {
          id: true,
          attendance_status: true
        }
      }
    }
  });

  if (!match) {
    throw new ApiError(404, "NOT_FOUND", "Match not found.");
  }

  const teamIds = [match.home_team_id, match.away_team_id].filter((teamId): teamId is string => Boolean(teamId));

  const [teamMembership, participant] = await Promise.all([
    teamIds.length > 0
      ? db.teamMember.findFirst({
          where: {
            user_id: currentUserId,
            status: TeamMemberStatus.active,
            team_id: {
              in: teamIds
            }
          },
          select: {
            team_id: true,
            role: true,
            status: true
          }
        })
      : Promise.resolve(null),
    db.matchParticipant.findFirst({
      where: {
        match_id: matchId,
        user_id: currentUserId
      },
      select: {
        id: true,
        team_id: true,
        role: true,
        attendance_status: true
      }
    })
  ]);

  if (!teamMembership && !participant) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this match.");
  }

  return {
    match,
    teamMembership,
    participant
  };
}

async function requireMatchCaptainAccess(matchId: string, currentUserId: string) {
  const access = await requireMatchAccess(matchId, currentUserId);
  const teamIds = [access.match.home_team_id, access.match.away_team_id].filter((teamId): teamId is string => Boolean(teamId));

  const captainMembership =
    teamIds.length === 0
      ? null
      : await db.teamMember.findFirst({
          where: {
            user_id: currentUserId,
            status: TeamMemberStatus.active,
            role: TeamRole.captain,
            team_id: {
              in: teamIds
            }
          },
          select: {
            team_id: true,
            role: true
          }
        });

  if (!captainMembership) {
    throw new ApiError(403, "FORBIDDEN", "Captain permission is required to manage this match.");
  }

  return {
    ...access,
    captainMembership
  };
}

async function syncMatchPostStatus(tx: Prisma.TransactionClient, matchPostId: string) {
  const [matchPost, invitations] = await Promise.all([
    tx.matchPost.findUnique({
      where: {
        id: matchPostId
      },
      select: {
        status: true
      }
    }),
    tx.matchInvitation.findMany({
      where: {
        match_post_id: matchPostId
      },
      select: {
        status: true
      }
    })
  ]);

  if (!matchPost) {
    throw new ApiError(404, "NOT_FOUND", "Match post not found.");
  }

  if (matchPost.status === MatchPostStatus.cancelled || matchPost.status === MatchPostStatus.expired) {
    return;
  }

  let nextStatus: MatchPostStatus = MatchPostStatus.open;

  if (invitations.some((invitation) => invitation.status === MatchInvitationStatus.accepted)) {
    nextStatus = MatchPostStatus.matched;
  } else if (invitations.some((invitation) => invitation.status === MatchInvitationStatus.pending)) {
    nextStatus = MatchPostStatus.pending_confirmation;
  }

  if (nextStatus !== matchPost.status) {
    await tx.matchPost.update({
      where: {
        id: matchPostId
      },
      data: {
        status: nextStatus
      }
    });
  }
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
  const matchPost: MatchPostWithTeamAndMatch | null = await db.matchPost.findUnique({
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
      },
      scheduled_match: {
        include: {
          home_team: true,
          away_team: true,
          match_participants: {
            select: {
              id: true,
              attendance_status: true
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
    scheduled_match: matchPost.scheduled_match ? buildMatchSummary(matchPost.scheduled_match) : null,
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

export async function getMatchDetail(matchId: string, currentUserId: string) {
  const { match } = await requireMatchAccess(matchId, currentUserId);

  return buildMatchSummary(match);
}

export async function updateMatch(matchId: string, currentUserId: string, input: UpdateMatchInput) {
  const { match } = await requireMatchCaptainAccess(matchId, currentUserId);

  const nextStatus = input.status ?? match.status;
  const nextDate = input.date ? parseDateOnly(input.date) : match.date;
  const nextStartTime = input.start_time ? parseTimeOnly(input.start_time, "Start time") : match.start_time;
  const nextEndTime =
    input.end_time !== undefined ? (input.end_time ? parseTimeOnly(input.end_time, "End time") : null) : match.end_time;

  if (nextEndTime && nextEndTime <= nextStartTime) {
    throw new ApiError(400, "VALIDATION_ERROR", "End time must be later than start time.");
  }

  const nextHomeScore = input.home_score !== undefined ? input.home_score : match.home_score;
  const nextAwayScore = input.away_score !== undefined ? input.away_score : match.away_score;
  const nextResultNote = input.result_note !== undefined ? input.result_note : match.result_note;
  const isScorePayloadPresent =
    input.home_score !== undefined || input.away_score !== undefined || input.result_note !== undefined;

  if (isScorePayloadPresent && nextStatus !== MatchStatus.completed) {
    throw new ApiError(400, "VALIDATION_ERROR", "Scores and result notes can only be set when the match is completed.");
  }

  if (nextStatus === MatchStatus.completed && (nextHomeScore === null || nextAwayScore === null)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Both home_score and away_score are required to complete the match.");
  }

  const data: Prisma.MatchUpdateInput = {};

  if (input.status !== undefined) {
    data.status = input.status;
  }

  if (input.date !== undefined) {
    data.date = nextDate;
  }

  if (input.start_time !== undefined) {
    data.start_time = nextStartTime;
  }

  if (input.end_time !== undefined) {
    data.end_time = nextEndTime;
  }

  if (input.timezone !== undefined) {
    data.timezone = input.timezone;
  }

  if (input.city_code !== undefined) {
    data.city_code = input.city_code;
  }

  if (input.district_code !== undefined) {
    data.district_code = input.district_code;
  }

  if (input.venue_name !== undefined) {
    data.venue_name = input.venue_name;
  }

  if (input.venue_address !== undefined) {
    data.venue_address = input.venue_address;
  }

  if (input.field_type !== undefined) {
    data.field_type = input.field_type;
  }

  if (nextStatus === MatchStatus.completed) {
    data.home_score = nextHomeScore;
    data.away_score = nextAwayScore;
    data.result_note = nextResultNote;
    data.completed_at = match.completed_at ?? new Date();
    data.cancelled_at = null;
  } else if (input.status !== undefined) {
    if (input.status === MatchStatus.cancelled) {
      data.cancelled_at = match.cancelled_at ?? new Date();
    } else if (match.cancelled_at) {
      data.cancelled_at = null;
    }

    if (match.status === MatchStatus.completed || input.status === MatchStatus.cancelled) {
      data.home_score = null;
      data.away_score = null;
      data.result_note = null;
      data.completed_at = null;
    }
  }

  const updatedMatch = await db.match.update({
    where: {
      id: matchId
    },
    data,
    include: {
      home_team: true,
      away_team: true,
      match_participants: {
        select: {
          id: true,
          attendance_status: true
        }
      }
    }
  });

  return buildMatchSummary(updatedMatch);
}

export async function listMatchParticipants(matchId: string, currentUserId: string) {
  await requireMatchAccess(matchId, currentUserId);

  const participants = await db.matchParticipant.findMany({
    where: {
      match_id: matchId
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          short_code: true,
          logo_url: true
        }
      }
    },
    orderBy: [{ team_id: "asc" }, { role: "asc" }, { created_at: "asc" }]
  });

  return participants.map((participant) => buildMatchParticipantSummary(participant));
}

export async function updateMatchParticipantAttendance(
  matchId: string,
  participantId: string,
  attendanceStatus: "confirmed" | "declined" | "checked_in" | "absent",
  currentUserId: string
) {
  const { match, teamMembership } = await requireMatchAccess(matchId, currentUserId);

  const participant = await db.matchParticipant.findUnique({
    where: {
      id: participantId
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          short_code: true,
          logo_url: true
        }
      }
    }
  });

  if (!participant || participant.match_id !== match.id) {
    throw new ApiError(404, "NOT_FOUND", "Match participant not found.");
  }

  const canUpdateSelf = participant.user_id === currentUserId;
  const canCaptainManage =
    Boolean(teamMembership) &&
    teamMembership?.role === TeamRole.captain &&
    participant.team_id !== null &&
    participant.team_id === teamMembership.team_id;

  if (!canUpdateSelf && !canCaptainManage) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to update this participant.");
  }

  if (participant.attendance_status === attendanceStatus) {
    return buildMatchParticipantSummary(participant);
  }

  const updatedParticipant = await db.matchParticipant.update({
    where: {
      id: participantId
    },
    data: {
      attendance_status: attendanceStatus
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          short_code: true,
          logo_url: true
        }
      }
    }
  });

  return buildMatchParticipantSummary(updatedParticipant);
}

export async function updateMatchParticipantStats(
  matchId: string,
  participantId: string,
  input: UpdateMatchParticipantStatsInput,
  currentUserId: string
) {
  const { match, captainMembership } = await requireMatchCaptainAccess(matchId, currentUserId);

  const participant = await db.matchParticipant.findUnique({
    where: {
      id: participantId
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          short_code: true,
          logo_url: true
        }
      }
    }
  });

  if (!participant || participant.match_id !== match.id) {
    throw new ApiError(404, "NOT_FOUND", "Match participant not found.");
  }

  if (!participant.team_id || participant.team_id !== captainMembership.team_id) {
    throw new ApiError(403, "FORBIDDEN", "You can only update stats for participants on your team.");
  }

  const updatedParticipant = await db.matchParticipant.update({
    where: {
      id: participantId
    },
    data: {
      ...(input.goals !== undefined ? { goals: input.goals } : {}),
      ...(input.assists !== undefined ? { assists: input.assists } : {}),
      ...(input.is_mvp !== undefined ? { is_mvp: input.is_mvp } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          short_code: true,
          logo_url: true
        }
      }
    }
  });

  return buildMatchParticipantSummary(updatedParticipant);
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

export async function listMatchPostInvitations(matchPostId: string, currentUserId: string) {
  const captainMemberships = await db.teamMember.findMany({
    where: {
      user_id: currentUserId,
      status: TeamMemberStatus.active,
      role: TeamRole.captain
    },
    select: {
      team_id: true
    }
  });

  if (captainMemberships.length === 0) {
    return [];
  }

  const captainTeamIds = captainMemberships.map((membership) => membership.team_id);

  const invitations = await db.matchInvitation.findMany({
    where: {
      match_post_id: matchPostId,
      OR: [
        {
          inviter_team_id: {
            in: captainTeamIds
          }
        },
        {
          target_team_id: {
            in: captainTeamIds
          }
        }
      ]
    },
    include: {
      match_post: {
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
      },
      inviter_team: true,
      target_team: true
    },
    orderBy: [{ created_at: "desc" }]
  });

  return invitations.map((invitation) => buildMatchInvitationSummary(invitation));
}

export async function listTeamMatchInvitations(teamId: string, currentUserId: string) {
  await requireTeamCaptainAccess(teamId, currentUserId);

  const [incoming, outgoing] = await Promise.all([
    db.matchInvitation.findMany({
      where: {
        target_team_id: teamId
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      },
      orderBy: [{ created_at: "desc" }]
    }),
    db.matchInvitation.findMany({
      where: {
        inviter_team_id: teamId
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      },
      orderBy: [{ created_at: "desc" }]
    })
  ]);

  return {
    incoming: incoming.map((invitation) => buildMatchInvitationSummary(invitation)),
    outgoing: outgoing.map((invitation) => buildMatchInvitationSummary(invitation))
  };
}

export async function createMatchInvitation(
  input: {
    match_post_id: string;
    inviter_team_id: string;
    note?: string;
  },
  createdByUserId: string
) {
  await requireTeamCaptainAccess(input.inviter_team_id, createdByUserId);

  const matchPost = await db.matchPost.findUnique({
    where: {
      id: input.match_post_id
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

  if (matchPost.team_id === input.inviter_team_id) {
    throw new ApiError(409, "CONFLICT", "You cannot invite your own team.");
  }

  if (
    matchPost.status === MatchPostStatus.matched ||
    matchPost.status === MatchPostStatus.cancelled ||
    matchPost.status === MatchPostStatus.expired
  ) {
    throw new ApiError(409, "CONFLICT", "This match post is no longer accepting invitations.");
  }

  const existingInvitation = await db.matchInvitation.findFirst({
    where: {
      match_post_id: input.match_post_id,
      inviter_team_id: input.inviter_team_id,
      status: {
        in: [MatchInvitationStatus.pending, MatchInvitationStatus.accepted]
      }
    },
    include: {
      match_post: {
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
      },
      inviter_team: true,
      target_team: true
    },
    orderBy: [{ created_at: "desc" }]
  });

  if (existingInvitation) {
    if (existingInvitation.status === MatchInvitationStatus.pending) {
      throw new ApiError(409, "CONFLICT", "Invitation has already been sent for this team.");
    }

    throw new ApiError(409, "CONFLICT", "This team has already matched with the post.");
  }

  const invitation = await db.$transaction(async (tx) => {
    const createdInvitation = await tx.matchInvitation.create({
      data: {
        match_post_id: input.match_post_id,
        inviter_team_id: input.inviter_team_id,
        target_team_id: matchPost.team_id,
        note: input.note,
        created_by: createdByUserId
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      }
    });

    await syncMatchPostStatus(tx, input.match_post_id);

    return createdInvitation;
  });

  return buildMatchInvitationSummary(invitation);
}

async function getInvitationForActor(invitationId: string) {
  const invitation = await db.matchInvitation.findUnique({
    where: {
      id: invitationId
    },
    include: {
      match_post: {
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
      },
      inviter_team: true,
      target_team: true
    }
  });

  if (!invitation) {
    throw new ApiError(404, "NOT_FOUND", "Match invitation not found.");
  }

  return invitation;
}

export async function acceptMatchInvitation(invitationId: string, currentUserId: string) {
  const invitation = await getInvitationForActor(invitationId);
  await requireTeamCaptainAccess(invitation.target_team_id, currentUserId);

  if (invitation.status === MatchInvitationStatus.accepted) {
    return buildMatchInvitationSummary(invitation);
  }

  if (invitation.status !== MatchInvitationStatus.pending) {
    throw new ApiError(409, "CONFLICT", "Invitation is no longer pending.");
  }

  const result = await db.$transaction(async (tx) => {
    const now = new Date();

    const acceptedInvitation = await tx.matchInvitation.update({
      where: {
        id: invitationId
      },
      data: {
        status: MatchInvitationStatus.accepted,
        responded_at: now
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      }
    });

    await tx.matchInvitation.updateMany({
      where: {
        match_post_id: invitation.match_post_id,
        id: {
          not: invitationId
        },
        status: MatchInvitationStatus.pending
      },
      data: {
        status: MatchInvitationStatus.cancelled,
        responded_at: now
      }
    });

    const match = await upsertMatchForAcceptedInvitation(tx, acceptedInvitation, currentUserId);
    await seedMatchParticipantsForTeams(tx, match.id, [acceptedInvitation.target_team_id, acceptedInvitation.inviter_team_id]);
    await syncMatchPostStatus(tx, invitation.match_post_id);

    return acceptedInvitation;
  });

  return buildMatchInvitationSummary(result);
}

export async function rejectMatchInvitation(invitationId: string, currentUserId: string) {
  const invitation = await getInvitationForActor(invitationId);
  await requireTeamCaptainAccess(invitation.target_team_id, currentUserId);

  if (invitation.status === MatchInvitationStatus.rejected) {
    return buildMatchInvitationSummary(invitation);
  }

  if (invitation.status !== MatchInvitationStatus.pending) {
    throw new ApiError(409, "CONFLICT", "Invitation is no longer pending.");
  }

  const result = await db.$transaction(async (tx) => {
    const rejectedInvitation = await tx.matchInvitation.update({
      where: {
        id: invitationId
      },
      data: {
        status: MatchInvitationStatus.rejected,
        responded_at: new Date()
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      }
    });

    await syncMatchPostStatus(tx, invitation.match_post_id);

    return rejectedInvitation;
  });

  return buildMatchInvitationSummary(result);
}

export async function cancelMatchInvitation(invitationId: string, currentUserId: string) {
  const invitation = await getInvitationForActor(invitationId);
  await requireTeamCaptainAccess(invitation.inviter_team_id, currentUserId);

  if (invitation.status === MatchInvitationStatus.cancelled) {
    return buildMatchInvitationSummary(invitation);
  }

  if (invitation.status !== MatchInvitationStatus.pending) {
    throw new ApiError(409, "CONFLICT", "Invitation is no longer pending.");
  }

  const result = await db.$transaction(async (tx) => {
    const cancelledInvitation = await tx.matchInvitation.update({
      where: {
        id: invitationId
      },
      data: {
        status: MatchInvitationStatus.cancelled,
        responded_at: new Date()
      },
      include: {
        match_post: {
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
        },
        inviter_team: true,
        target_team: true
      }
    });

    await syncMatchPostStatus(tx, invitation.match_post_id);

    return cancelledInvitation;
  });

  return buildMatchInvitationSummary(result);
}
