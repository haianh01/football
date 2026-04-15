import { MatchInvitationStatus, PaymentStatus, Prisma, TeamMemberStatus, TeamRole, TeamFeeStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";

import type {
  CreateTeamFeeFromInvitationInput,
  TeamFeeAssigneeSummary,
  TeamFeeSummary,
  UpdateTeamFeeAssigneePaymentInput
} from "./types";

export const TEAM_FEE_INCLUDE = {
  assignees: {
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          avatar_url: true
        }
      }
    },
    orderBy: [{ created_at: "asc" }]
  }
} satisfies Prisma.TeamFeeInclude;

type TeamFeeWithRelations = Prisma.TeamFeeGetPayload<{
  include: typeof TEAM_FEE_INCLUDE;
}>;

function sanitizeOptionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeAssigneeStatus(
  assignee: {
    amount_due_minor: bigint;
    amount_paid_minor: bigint;
    payment_status: PaymentStatus;
  },
  dueAt: Date,
  now = new Date()
): TeamFeeAssigneeSummary["payment_status"] {
  if (assignee.payment_status === PaymentStatus.paid || assignee.payment_status === PaymentStatus.waived) {
    return assignee.payment_status;
  }

  if (assignee.amount_paid_minor > 0n && assignee.amount_paid_minor < assignee.amount_due_minor) {
    return dueAt < now ? "overdue" : "partially_paid";
  }

  if (dueAt < now) {
    return "overdue";
  }

  return "pending";
}

function normalizeFeeStatus(fee: TeamFeeWithRelations, assigneeStatuses: TeamFeeAssigneeSummary["payment_status"][]) {
  if (fee.status === TeamFeeStatus.cancelled) {
    return "cancelled";
  }

  if (assigneeStatuses.length === 0) {
    return "open";
  }

  const settledStatuses = new Set<TeamFeeAssigneeSummary["payment_status"]>(["paid", "waived"]);
  const allSettled = assigneeStatuses.every((status) => settledStatuses.has(status));

  if (allSettled) {
    return "paid";
  }

  const hasProgress = fee.assignees.some((assignee) => assignee.amount_paid_minor > 0n) || assigneeStatuses.includes("waived");
  if (hasProgress || assigneeStatuses.includes("partially_paid")) {
    return "partially_paid";
  }

  if (assigneeStatuses.includes("overdue")) {
    return "overdue";
  }

  return "open";
}

export function buildTeamFeeSummary(fee: TeamFeeWithRelations, now = new Date()): TeamFeeSummary {
  const assignees = fee.assignees.map((assignee) => ({
    id: assignee.id,
    user_id: assignee.user_id,
    display_name: assignee.user.display_name,
    avatar_url: assignee.user.avatar_url,
    amount_due_minor: Number(assignee.amount_due_minor),
    amount_paid_minor: Number(assignee.amount_paid_minor),
    payment_status: normalizeAssigneeStatus(assignee, fee.due_at, now),
    paid_at: assignee.paid_at?.toISOString() ?? null,
    request_count: assignee.request_count,
    last_requested_at: assignee.last_requested_at?.toISOString() ?? null
  }));
  const assigneeStatuses = assignees.map((assignee) => assignee.payment_status);
  const lastRequestedAt = assignees
    .map((assignee) => assignee.last_requested_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  return {
    id: fee.id,
    team_id: fee.team_id,
    match_invitation_id: fee.match_invitation_id,
    title: fee.title,
    description: fee.description,
    fee_type: fee.fee_type,
    distribution_type: fee.distribution_type,
    currency_code: fee.currency_code,
    total_amount_minor: Number(fee.total_amount_minor),
    total_collected_minor: assignees.reduce((sum, assignee) => sum + assignee.amount_paid_minor, 0),
    due_at: fee.due_at.toISOString(),
    status: normalizeFeeStatus(fee, assigneeStatuses),
    created_at: fee.created_at.toISOString(),
    assignee_count: assignees.length,
    paid_count: assignees.filter((assignee) => assignee.payment_status === "paid").length,
    outstanding_count: assignees.filter((assignee) => !["paid", "waived"].includes(assignee.payment_status)).length,
    overdue_count: assignees.filter((assignee) => assignee.payment_status === "overdue").length,
    last_requested_at: lastRequestedAt,
    assignees
  };
}

async function requireTeamFinanceAccess(teamId: string, currentUserId: string) {
  const membership = await db.teamMember.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: currentUserId
      }
    },
    select: {
      role: true,
      status: true
    }
  });

  if (!membership || membership.status !== TeamMemberStatus.active) {
    throw new ApiError(403, "FORBIDDEN", "Bạn phải là thành viên active của đội để thao tác khoản thu.");
  }
}

function buildDebtMutation(delta: bigint) {
  if (delta === 0n) {
    return null;
  }

  return delta > 0n ? { increment: delta } : { decrement: -delta };
}

async function applyDebtDelta(tx: Prisma.TransactionClient, teamId: string, userId: string, delta: bigint) {
  const debtMutation = buildDebtMutation(delta);

  if (!debtMutation) {
    return;
  }

  await tx.teamMember.updateMany({
    where: {
      team_id: teamId,
      user_id: userId
    },
    data: {
      current_debt_amount_minor: debtMutation
    }
  });
}

async function rollupTeamFeeStatus(tx: Prisma.TransactionClient, teamFeeId: string) {
  const fee = await tx.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: TEAM_FEE_INCLUDE
  });

  if (!fee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  const summary = buildTeamFeeSummary(fee);
  const nextStatus = summary.status;

  if (fee.status !== nextStatus) {
    await tx.teamFee.update({
      where: {
        id: teamFeeId
      },
      data: {
        status: nextStatus
      }
    });
  }
}

export async function getTeamFeeById(teamFeeId: string, currentUserId: string) {
  const fee = await db.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: TEAM_FEE_INCLUDE
  });

  if (!fee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  await requireTeamFinanceAccess(fee.team_id, currentUserId);
  return buildTeamFeeSummary(fee);
}

export async function listTeamFees(teamId: string, currentUserId: string) {
  await requireTeamFinanceAccess(teamId, currentUserId);

  const fees = await db.teamFee.findMany({
    where: {
      team_id: teamId,
      status: {
        not: TeamFeeStatus.cancelled
      }
    },
    include: TEAM_FEE_INCLUDE,
    orderBy: [{ due_at: "asc" }, { created_at: "desc" }],
    take: 10
  });

  return fees.map((fee) => buildTeamFeeSummary(fee));
}

export async function createTeamFeeFromInvitationVotes(
  invitationId: string,
  currentUserId: string,
  input: CreateTeamFeeFromInvitationInput
) {
  if (!Number.isFinite(input.amount_per_member_minor) || input.amount_per_member_minor <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Số tiền mỗi người phải lớn hơn 0.");
  }

  const dueAt = new Date(input.due_at);
  if (Number.isNaN(dueAt.getTime())) {
    throw new ApiError(400, "VALIDATION_ERROR", "Hạn thanh toán không hợp lệ.");
  }

  const invitation = await db.matchInvitation.findUnique({
    where: {
      id: invitationId
    },
    include: {
      match_post: {
        select: {
          id: true,
          title: true,
          date: true,
          currency_code: true,
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: [{ created_at: "asc" }]
      },
      team_fee: {
        include: TEAM_FEE_INCLUDE
      }
    }
  });

  if (!invitation) {
    throw new ApiError(404, "NOT_FOUND", "Lời mời chốt kèo không tồn tại.");
  }

  await requireTeamFinanceAccess(invitation.match_post.team.id, currentUserId);

  if (invitation.status !== MatchInvitationStatus.accepted) {
    throw new ApiError(409, "CONFLICT", "Chỉ tạo khoản thu khi lời mời đã được chấp nhận.");
  }

  if (invitation.team_fee) {
    return buildTeamFeeSummary(invitation.team_fee);
  }

  const voters = invitation.votes;
  if (voters.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Chưa có người vote để tạo khoản thu.");
  }

  const amountPerMemberMinor = BigInt(Math.trunc(input.amount_per_member_minor));
  const totalAmountMinor = amountPerMemberMinor * BigInt(voters.length);
  const title =
    sanitizeOptionalString(input.title) ??
    `Thu tiền kèo ${invitation.match_post.title || invitation.match_post.date.toISOString().slice(0, 10)}`;
  const description =
    sanitizeOptionalString(input.description) ??
    `Khoản thu tạo từ ${voters.length} người đã vote cho lời mời chốt kèo.`;

  const fee = await db.$transaction(async (tx) => {
    const createdFee = await tx.teamFee.create({
      data: {
        team_id: invitation.match_post.team.id,
        match_invitation_id: invitation.id,
        title,
        description,
        fee_type: "pitch",
        distribution_type: "fixed_per_member",
        currency_code: invitation.match_post.currency_code,
        total_amount_minor: totalAmountMinor,
        due_at: dueAt,
        status: TeamFeeStatus.open,
        created_by: currentUserId,
        assignees: {
          create: voters.map((vote) => ({
            user_id: vote.user_id,
            amount_due_minor: amountPerMemberMinor
          }))
        }
      },
      include: TEAM_FEE_INCLUDE
    });

    await Promise.all(
      voters.map((vote) => applyDebtDelta(tx, invitation.match_post.team.id, vote.user_id, amountPerMemberMinor))
    );

    return createdFee;
  });

  return buildTeamFeeSummary(fee);
}

export async function sendTeamFeeCollectionRequests(teamFeeId: string, currentUserId: string) {
  const fee = await db.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: TEAM_FEE_INCLUDE
  });

  if (!fee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  await requireTeamFinanceAccess(fee.team_id, currentUserId);

  const now = new Date();

  await db.teamFeeAssignee.updateMany({
    where: {
      team_fee_id: teamFeeId,
      payment_status: {
        notIn: [PaymentStatus.paid, PaymentStatus.waived]
      }
    },
    data: {
      request_count: {
        increment: 1
      },
      last_requested_at: now
    }
  });

  const updatedFee = await db.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: TEAM_FEE_INCLUDE
  });

  if (!updatedFee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  return buildTeamFeeSummary(updatedFee);
}

export async function updateTeamFeeAssigneePaymentStatus(
  teamFeeId: string,
  assigneeId: string,
  currentUserId: string,
  input: UpdateTeamFeeAssigneePaymentInput
) {
  if (!["pending", "paid"].includes(input.payment_status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Trạng thái thanh toán không hợp lệ.");
  }

  const fee = await db.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: {
      assignees: true
    }
  });

  if (!fee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  await requireTeamFinanceAccess(fee.team_id, currentUserId);

  const currentAssignee = fee.assignees.find((assignee) => assignee.id === assigneeId);
  if (!currentAssignee) {
    throw new ApiError(404, "NOT_FOUND", "Người được thu không tồn tại.");
  }

  const outstandingBefore =
    currentAssignee.payment_status === PaymentStatus.paid || currentAssignee.payment_status === PaymentStatus.waived
      ? 0n
      : currentAssignee.amount_due_minor - currentAssignee.amount_paid_minor;
  const nextOutstanding = input.payment_status === "paid" ? 0n : currentAssignee.amount_due_minor;
  const debtDelta = nextOutstanding - outstandingBefore;

  await db.$transaction(async (tx) => {
    await tx.teamFeeAssignee.update({
      where: {
        id: assigneeId
      },
      data: {
        payment_status: input.payment_status,
        amount_paid_minor: input.payment_status === "paid" ? currentAssignee.amount_due_minor : 0n,
        paid_at: input.payment_status === "paid" ? new Date() : null
      }
    });

    await applyDebtDelta(tx, fee.team_id, currentAssignee.user_id, debtDelta);
    await rollupTeamFeeStatus(tx, teamFeeId);
  });

  const updatedFee = await db.teamFee.findUnique({
    where: {
      id: teamFeeId
    },
    include: TEAM_FEE_INCLUDE
  });

  if (!updatedFee) {
    throw new ApiError(404, "NOT_FOUND", "Khoản thu không tồn tại.");
  }

  return buildTeamFeeSummary(updatedFee);
}
