import { AttendanceStatus, InviteStatus, InviteType, MatchInvitationStatus, MatchStatus, TeamFeeStatus, TeamMemberStatus, TeamRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { slugify } from "@/lib/slug";
import { buildTeamFeeSummary, TEAM_FEE_INCLUDE } from "@/features/team-finance";
import {
  CreateTeamInput,
  UpdateTeamInput,
  UpdateTeamMemberInput,
  parseCreateTeamInput,
  parseUpdateTeamInput,
  parseUpdateTeamMemberInput
} from "./validation";

export { parseCreateTeamInput, parseUpdateTeamInput, parseUpdateTeamMemberInput };
export type { CreateTeamInput, UpdateTeamInput, UpdateTeamMemberInput };

type TeamMemberWithUser = Prisma.TeamMemberGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        display_name: true;
        avatar_url: true;
      };
    };
  };
}>;

function buildTeamMemberSummary(member: TeamMemberWithUser) {
  return {
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
  };
}

export async function listTeamsForUser(userId: string) {
  const memberships = await db.teamMember.findMany({
    where: {
      user_id: userId,
      status: TeamMemberStatus.active
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
  return db.teamMember.findFirst({
    where: {
      team_id: teamId,
      user_id: userId,
      status: TeamMemberStatus.active
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
    home_city_code: team.home_city_code,
    home_district_code: team.home_district_code,
    skill_level_code: team.skill_level_code,
    default_locale: team.default_locale,
    play_style_code: team.play_style_code,
    primary_color: team.primary_color,
    secondary_color: team.secondary_color,
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [teamDetail, members, pendingMatchInvitations, upcomingMatches, teamFees] = await Promise.all([
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
    }),
    db.matchInvitation.findMany({
      where: {
        target_team_id: teamId,
        status: MatchInvitationStatus.pending
      },
      include: {
        inviter_team: {
          select: {
            id: true,
            name: true,
            short_code: true,
            logo_url: true
          }
        },
        match_post: {
          select: {
            id: true,
            title: true,
            status: true,
            date: true,
            start_time: true,
            venue_name: true
          }
        }
      },
      orderBy: [{ created_at: "desc" }],
      take: 5
    }),
    db.match.findMany({
      where: {
        status: {
          in: [MatchStatus.scheduled, MatchStatus.confirmed]
        },
        date: {
          gte: today
        },
        OR: [
          {
            home_team_id: teamId
          },
          {
            away_team_id: teamId
          }
        ]
      },
      include: {
        home_team: {
          select: {
            id: true,
            name: true,
            short_code: true,
            logo_url: true
          }
        },
        away_team: {
          select: {
            id: true,
            name: true,
            short_code: true,
            logo_url: true
          }
        },
        match_participants: {
          select: {
            team_id: true,
            attendance_status: true
          }
        }
      },
      orderBy: [{ date: "asc" }, { start_time: "asc" }],
      take: 5
    }),
    db.teamFee.findMany({
      where: {
        team_id: teamId,
        status: {
          not: TeamFeeStatus.cancelled
        }
      },
      include: TEAM_FEE_INCLUDE,
      orderBy: [{ due_at: "asc" }, { created_at: "desc" }],
      take: 5
    })
  ]);

  const activeMembers = members.filter((member) => member.status === TeamMemberStatus.active);
  const averageAttendanceRate =
    activeMembers.length === 0
      ? 0
      : activeMembers.reduce((sum, member) => sum + Number(member.attendance_rate), 0) / activeMembers.length;
  const availableParticipantStatuses = new Set<AttendanceStatus>([
    AttendanceStatus.invited,
    AttendanceStatus.confirmed,
    AttendanceStatus.checked_in
  ]);
  const requiredPlayersByFieldType = {
    five: 5,
    seven: 7,
    eleven: 11
  } as const;
  const upcomingMatchItems = upcomingMatches.map((match) => {
    const requiredPlayers = requiredPlayersByFieldType[match.field_type];
    const currentTeamAvailableCount = match.match_participants.filter(
      (participant) => participant.team_id === teamId && availableParticipantStatuses.has(participant.attendance_status)
    ).length;
    const currentTeamShortage = Math.max(0, requiredPlayers - currentTeamAvailableCount);

    return {
      id: match.id,
      source_match_post_id: match.source_match_post_id,
      status: match.status,
      date: match.date.toISOString().slice(0, 10),
      start_time: match.start_time.toISOString().slice(11, 16),
      end_time: match.end_time?.toISOString().slice(11, 16) ?? null,
      venue_name: match.venue_name,
      field_type: match.field_type,
      home_team: match.home_team,
      away_team: match.away_team,
      current_team_available_count: currentTeamAvailableCount,
      current_team_required_players: requiredPlayers,
      current_team_shortage: currentTeamShortage
    };
  });
  const upcomingMatchShortage = upcomingMatchItems.reduce((sum, match) => sum + match.current_team_shortage, 0);
  const canManageFinance = membership.role === TeamRole.captain || membership.role === TeamRole.treasurer;
  const feeSummaries = teamFees.map((fee) => buildTeamFeeSummary(fee));
  const overdueFeeAssignees = feeSummaries.reduce((sum, fee) => sum + fee.overdue_count, 0);
  const openFeeSummaries = canManageFinance ? feeSummaries : [];

  return {
    team_summary: {
      id: teamDetail.id,
      name: teamDetail.name,
      short_code: teamDetail.short_code,
      logo_url: teamDetail.logo_url,
      description: teamDetail.description,
      home_city_code: teamDetail.home_city_code,
      home_district_code: teamDetail.home_district_code,
      skill_level_code: teamDetail.skill_level_code,
      play_style_code: teamDetail.play_style_code,
      primary_color: teamDetail.primary_color,
      secondary_color: teamDetail.secondary_color,
      member_count: teamDetail.member_count,
      role_of_current_user: teamDetail.role_of_current_user
    },
    action_center: {
      pending_confirmations: pendingMatchInvitations.length,
      open_polls: 0,
      overdue_fee_assignees: overdueFeeAssignees,
      upcoming_match_shortage: upcomingMatchShortage
    },
    upcoming_matches: upcomingMatchItems,
    pending_match_invitations: pendingMatchInvitations.map((invitation) => ({
      id: invitation.id,
      status: invitation.status,
      created_at: invitation.created_at.toISOString(),
      inviter_team: invitation.inviter_team,
      match_post: {
        id: invitation.match_post.id,
        title: invitation.match_post.title,
        status: invitation.match_post.status,
        date: invitation.match_post.date.toISOString().slice(0, 10),
        start_time: invitation.match_post.start_time.toISOString().slice(11, 16),
        venue_name: invitation.match_post.venue_name
      }
    })),
    open_polls: [],
    open_fees: openFeeSummaries,
    member_summary: {
      active_members: activeMembers.length,
      average_attendance_rate: Number(averageAttendanceRate.toFixed(1))
    },
    members: members.map((member) => buildTeamMemberSummary(member))
  };
}

export async function updateTeam(teamId: string, currentUserId: string, input: UpdateTeamInput) {
  await requireTeamCaptainAccess(teamId, currentUserId);

  const existingTeam = await db.team.findUnique({
    where: {
      id: teamId
    },
    select: {
      id: true
    }
  });

  if (!existingTeam) {
    throw new ApiError(404, "NOT_FOUND", "Team not found.");
  }

  await db.team.update({
    where: {
      id: teamId
    },
    data: {
      name: input.name,
      logo_url: input.logo_url,
      description: input.description,
      home_city_code: input.home_city_code,
      home_district_code: input.home_district_code,
      skill_level_code: input.skill_level_code,
      play_style_code: input.play_style_code,
      primary_color: input.primary_color,
      secondary_color: input.secondary_color
    }
  });

  return getTeamDetail(teamId, currentUserId);
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

async function countOtherActiveCaptains(teamId: string, excludedMemberId: string) {
  return db.teamMember.count({
    where: {
      team_id: teamId,
      status: TeamMemberStatus.active,
      role: TeamRole.captain,
      NOT: {
        id: excludedMemberId
      }
    }
  });
}

export async function updateTeamMember(
  teamId: string,
  memberId: string,
  currentUserId: string,
  input: UpdateTeamMemberInput
) {
  const [requestMembership, member] = await Promise.all([
    db.teamMember.findFirst({
      where: {
        team_id: teamId,
        user_id: currentUserId,
        status: TeamMemberStatus.active
      },
      select: {
        id: true,
        user_id: true,
        role: true,
        status: true
      }
    }),
    db.teamMember.findUnique({
      where: {
        id: memberId
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true
          }
        }
      }
    })
  ]);

  if (!member || member.team_id !== teamId) {
    throw new ApiError(404, "NOT_FOUND", "Team member not found.");
  }

  if (!requestMembership) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this team.");
  }

  const isSelf = member.user_id === currentUserId;

  if (isSelf) {
    if (input.role) {
      throw new ApiError(403, "FORBIDDEN", "You cannot change your own role.");
    }

    if (input.status !== TeamMemberStatus.inactive) {
      throw new ApiError(403, "FORBIDDEN", "You can only leave the team yourself.");
    }
  } else if (requestMembership.role !== TeamRole.captain) {
    throw new ApiError(403, "FORBIDDEN", "Captain permission is required.");
  }

  const nextRole = (input.role as TeamRole | undefined) ?? member.role;
  const nextStatus = (input.status as TeamMemberStatus | undefined) ?? member.status;

  if (
    member.role === TeamRole.captain &&
    member.status === TeamMemberStatus.active &&
    (nextRole !== TeamRole.captain || nextStatus !== TeamMemberStatus.active)
  ) {
    const otherCaptains = await countOtherActiveCaptains(teamId, member.id);

    if (otherCaptains === 0) {
      throw new ApiError(409, "CONFLICT", "Assign another active captain before changing the last captain.");
    }
  }

  if (nextRole === member.role && nextStatus === member.status) {
    return buildTeamMemberSummary(member);
  }

  const updatedMember = await db.teamMember.update({
    where: {
      id: memberId
    },
    data: {
      role: nextRole,
      status: nextStatus
    },
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      }
    }
  });

  return buildTeamMemberSummary(updatedMember);
}

async function createUniqueInviteCode(prefix = "VPINV") {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `${prefix}-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const existing = await db.teamInvite.findUnique({
      where: {
        invite_code: candidate
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError(409, "CONFLICT", "Unable to generate a unique invite code.");
}

export async function createTeamInvite(teamId: string, createdByUserId: string, options?: { expiresInDays?: number }) {
  await requireTeamCaptainAccess(teamId, createdByUserId);

  const expiresInDays = options?.expiresInDays ?? 14;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  const inviteCode = await createUniqueInviteCode();

  const invite = await db.teamInvite.create({
    data: {
      team_id: teamId,
      invite_type: InviteType.code,
      invite_code: inviteCode,
      status: InviteStatus.pending,
      expires_at: expiresAt,
      created_by: createdByUserId
    }
  });

  return {
    id: invite.id,
    team_id: invite.team_id,
    invite_type: invite.invite_type,
    invite_code: invite.invite_code,
    status: invite.status,
    expires_at: invite.expires_at.toISOString(),
    created_at: invite.created_at.toISOString()
  };
}

export async function listTeamInvites(teamId: string, currentUserId: string) {
  await requireTeamCaptainAccess(teamId, currentUserId);

  const now = new Date();
  const invites = await db.teamInvite.findMany({
    where: {
      team_id: teamId
    },
    orderBy: [{ created_at: "desc" }],
    take: 25
  });

  return invites.map((invite) => {
    const derivedStatus =
      invite.status === InviteStatus.pending && invite.expires_at <= now ? InviteStatus.expired : invite.status;

    return {
      id: invite.id,
      team_id: invite.team_id,
      invite_type: invite.invite_type,
      invite_code: invite.invite_code,
      status: derivedStatus,
      expires_at: invite.expires_at.toISOString(),
      created_at: invite.created_at.toISOString()
    };
  });
}

export async function revokeTeamInvite(teamId: string, inviteId: string, currentUserId: string) {
  await requireTeamCaptainAccess(teamId, currentUserId);

  const invite = await db.teamInvite.findUnique({
    where: {
      id: inviteId
    },
    select: {
      id: true,
      team_id: true,
      status: true
    }
  });

  if (!invite || invite.team_id !== teamId) {
    throw new ApiError(404, "NOT_FOUND", "Invite not found.");
  }

  if (invite.status !== InviteStatus.pending) {
    return;
  }

  await db.teamInvite.update({
    where: {
      id: inviteId
    },
    data: {
      status: InviteStatus.revoked
    }
  });
}

export async function acceptTeamInvite(inviteCode: string, currentUserId: string) {
  const normalizedCode = inviteCode.trim();

  if (!normalizedCode) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invite code is required.");
  }

  const now = new Date();

  return db.$transaction(async (tx) => {
    const invite = await tx.teamInvite.findUnique({
      where: {
        invite_code: normalizedCode
      }
    });

    if (!invite) {
      throw new ApiError(404, "NOT_FOUND", "Invite not found.");
    }

    if (invite.status === InviteStatus.accepted && invite.target_user_id === currentUserId) {
      return {
        team_id: invite.team_id
      };
    }

    if (invite.status !== InviteStatus.pending) {
      throw new ApiError(409, "CONFLICT", "Invite is no longer available.");
    }

    if (invite.expires_at <= now) {
      await tx.teamInvite.update({
        where: {
          id: invite.id
        },
        data: {
          status: InviteStatus.expired
        }
      });

      throw new ApiError(410, "GONE", "Invite has expired.");
    }

    const existingMembership = await tx.teamMember.findUnique({
      where: {
        team_id_user_id: {
          team_id: invite.team_id,
          user_id: currentUserId
        }
      },
      select: {
        id: true
      }
    });

    if (existingMembership) {
      await tx.teamInvite.update({
        where: {
          id: invite.id
        },
        data: {
          status: InviteStatus.accepted,
          target_user_id: currentUserId
        }
      });

      return {
        team_id: invite.team_id
      };
    }

    await tx.teamMember.create({
      data: {
        team_id: invite.team_id,
        user_id: currentUserId,
        role: TeamRole.member,
        status: TeamMemberStatus.active,
        joined_at: now
      }
    });

    await tx.teamInvite.update({
      where: {
        id: invite.id
      },
      data: {
        status: InviteStatus.accepted,
        target_user_id: currentUserId
      }
    });

    return {
      team_id: invite.team_id
    };
  });
}
