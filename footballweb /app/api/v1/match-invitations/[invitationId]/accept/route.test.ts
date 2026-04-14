import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const acceptMatchInvitationMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  acceptMatchInvitation: acceptMatchInvitationMock
}));

describe("POST /api/v1/match-invitations/[invitationId]/accept", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts an invitation", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    acceptMatchInvitationMock.mockResolvedValue({ id: "inv-1", status: "accepted" });

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost:3000/api/v1/match-invitations/inv-1/accept"), {
      params: Promise.resolve({ invitationId: "inv-1" })
    });
    const json = await response.json();

    expect(acceptMatchInvitationMock).toHaveBeenCalledWith("inv-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "inv-1", status: "accepted" });
  });
});
