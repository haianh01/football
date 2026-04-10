import { InviteStatus, InviteType, TeamMemberStatus, TeamRole } from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { slugify } from "@/lib/slug";
import { CreateTeamInput, parseCreateTeamInput } from "./validation";

export { parseCreateTeamInput };
export type { CreateTeamInput };

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
