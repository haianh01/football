import { beforeEach, describe, expect, it, vi } from "vitest";

const createTeamFeeFromInvitationVotesMock = vi.fn();
const requireCurrentUserMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-finance", () => ({
  createTeamFeeFromInvitationVotes: createTeamFeeFromInvitationVotesMock
}));

describe("POST /api/v1/match-invitations/[invitationId]/fee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a team fee from invitation votes", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    createTeamFeeFromInvitationVotesMock.mockResolvedValue({ id: "fee-1", status: "open" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/match-invitations/inv-1/fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "Tiền sân",
          amount_per_member_minor: 50000,
          due_at: "2026-04-20T12:00:00.000Z"
        })
      }),
      {
        params: Promise.resolve({ invitationId: "inv-1" })
      }
    );
    const json = await response.json();

    expect(createTeamFeeFromInvitationVotesMock).toHaveBeenCalledWith("inv-1", "user-1", {
      title: "Tiền sân",
      description: undefined,
      amount_per_member_minor: 50000,
      due_at: "2026-04-20T12:00:00.000Z"
    });
    expect(response.status).toBe(201);
    expect(json.data).toEqual({ id: "fee-1", status: "open" });
  });
});
