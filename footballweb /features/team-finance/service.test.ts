import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = {
  teamMember: {
    findUnique: vi.fn(),
    updateMany: vi.fn()
  },
  matchInvitation: {
    findUnique: vi.fn()
  },
  teamFee: {
    create: vi.fn()
  },
  $transaction: vi.fn()
};

vi.mock("@/lib/db", () => ({
  db: dbMock
}));

describe("team-finance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds fee summary with overdue assignees", async () => {
    const { buildTeamFeeSummary } = await import("./service");

    const summary = buildTeamFeeSummary({
      id: "fee-1",
      team_id: "team-1",
      match_invitation_id: "inv-1",
      title: "Tiền sân",
      description: null,
      fee_type: "pitch",
      distribution_type: "fixed_per_member",
      currency_code: "VND",
      total_amount_minor: 100000n,
      due_at: new Date("2026-04-10T12:00:00.000Z"),
      status: "open",
      created_by: "user-1",
      created_at: new Date("2026-04-01T12:00:00.000Z"),
      updated_at: new Date("2026-04-01T12:00:00.000Z"),
      assignees: [
        {
          id: "assignee-1",
          team_fee_id: "fee-1",
          user_id: "member-1",
          amount_due_minor: 50000n,
          amount_paid_minor: 0n,
          payment_status: "pending",
          paid_at: null,
          request_count: 2,
          last_requested_at: new Date("2026-04-09T12:00:00.000Z"),
          created_at: new Date("2026-04-01T12:00:00.000Z"),
          updated_at: new Date("2026-04-01T12:00:00.000Z"),
          user: {
            id: "member-1",
            display_name: "Player One",
            avatar_url: null
          }
        },
        {
          id: "assignee-2",
          team_fee_id: "fee-1",
          user_id: "member-2",
          amount_due_minor: 50000n,
          amount_paid_minor: 50000n,
          payment_status: "paid",
          paid_at: new Date("2026-04-08T12:00:00.000Z"),
          request_count: 1,
          last_requested_at: new Date("2026-04-07T12:00:00.000Z"),
          created_at: new Date("2026-04-01T12:00:00.000Z"),
          updated_at: new Date("2026-04-08T12:00:00.000Z"),
          user: {
            id: "member-2",
            display_name: "Player Two",
            avatar_url: null
          }
        }
      ]
    } as never, new Date("2026-04-15T12:00:00.000Z"));

    expect(summary.status).toBe("partially_paid");
    expect(summary.overdue_count).toBe(1);
    expect(summary.paid_count).toBe(1);
    expect(summary.total_collected_minor).toBe(50000);
  });

  it("creates a fee from accepted invitation votes", async () => {
    dbMock.teamMember.findUnique.mockResolvedValue({
      role: "member",
      status: "active"
    });
    dbMock.matchInvitation.findUnique.mockResolvedValue({
      id: "inv-1",
      status: "accepted",
      match_post: {
        id: "post-1",
        title: "Kèo tối thứ 7",
        date: new Date("2026-04-20T00:00:00.000Z"),
        currency_code: "VND",
        team: {
          id: "team-1",
          name: "FC Home"
        }
      },
      votes: [
        {
          user_id: "member-1",
          user: {
            id: "member-1",
            display_name: "Player One",
            avatar_url: null
          }
        },
        {
          user_id: "member-2",
          user: {
            id: "member-2",
            display_name: "Player Two",
            avatar_url: null
          }
        }
      ],
      team_fee: null
    });
    dbMock.$transaction.mockImplementation(async (callback: (tx: typeof dbMock) => Promise<unknown>) => callback(dbMock));
    dbMock.teamFee.create.mockResolvedValue({
      id: "fee-1",
      team_id: "team-1",
      match_invitation_id: "inv-1",
      title: "Tiền sân",
      description: "Khoản thu tạo từ 2 người đã vote cho lời mời chốt kèo.",
      fee_type: "pitch",
      distribution_type: "fixed_per_member",
      currency_code: "VND",
      total_amount_minor: 100000n,
      due_at: new Date("2026-04-20T12:00:00.000Z"),
      status: "open",
      created_by: "user-1",
      created_at: new Date("2026-04-15T12:00:00.000Z"),
      updated_at: new Date("2026-04-15T12:00:00.000Z"),
      assignees: [
        {
          id: "assignee-1",
          team_fee_id: "fee-1",
          user_id: "member-1",
          amount_due_minor: 50000n,
          amount_paid_minor: 0n,
          payment_status: "pending",
          paid_at: null,
          request_count: 0,
          last_requested_at: null,
          created_at: new Date("2026-04-15T12:00:00.000Z"),
          updated_at: new Date("2026-04-15T12:00:00.000Z"),
          user: {
            id: "member-1",
            display_name: "Player One",
            avatar_url: null
          }
        },
        {
          id: "assignee-2",
          team_fee_id: "fee-1",
          user_id: "member-2",
          amount_due_minor: 50000n,
          amount_paid_minor: 0n,
          payment_status: "pending",
          paid_at: null,
          request_count: 0,
          last_requested_at: null,
          created_at: new Date("2026-04-15T12:00:00.000Z"),
          updated_at: new Date("2026-04-15T12:00:00.000Z"),
          user: {
            id: "member-2",
            display_name: "Player Two",
            avatar_url: null
          }
        }
      ]
    });
    dbMock.teamMember.updateMany.mockResolvedValue({ count: 1 });

    const { createTeamFeeFromInvitationVotes } = await import("./service");

    const result = await createTeamFeeFromInvitationVotes("inv-1", "user-1", {
      title: "Tiền sân",
      amount_per_member_minor: 50000,
      due_at: "2026-04-20T12:00:00.000Z"
    });

    expect(dbMock.teamFee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        team_id: "team-1",
        match_invitation_id: "inv-1",
        title: "Tiền sân",
        total_amount_minor: 100000n,
        assignees: {
          create: [
            {
              user_id: "member-1",
              amount_due_minor: 50000n
            },
            {
              user_id: "member-2",
              amount_due_minor: 50000n
            }
          ]
        }
      }),
      include: expect.any(Object)
    });
    expect(dbMock.teamMember.updateMany).toHaveBeenCalledTimes(2);
    expect(result.total_amount_minor).toBe(100000);
    expect(result.assignee_count).toBe(2);
  });
});
