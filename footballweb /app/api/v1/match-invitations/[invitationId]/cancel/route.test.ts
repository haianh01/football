import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const cancelMatchInvitationMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  cancelMatchInvitation: cancelMatchInvitationMock
}));

describe("POST /api/v1/match-invitations/[invitationId]/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cancels an invitation", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    cancelMatchInvitationMock.mockResolvedValue({ id: "inv-1", status: "cancelled" });

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost:3000/api/v1/match-invitations/inv-1/cancel"), {
      params: Promise.resolve({ invitationId: "inv-1" })
    });
    const json = await response.json();

    expect(cancelMatchInvitationMock).toHaveBeenCalledWith("inv-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "inv-1", status: "cancelled" });
  });
});
