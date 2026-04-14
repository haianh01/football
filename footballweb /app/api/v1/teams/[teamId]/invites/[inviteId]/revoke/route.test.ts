import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/http";

const requireCurrentUserMock = vi.fn();
const revokeTeamInviteMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  revokeTeamInvite: revokeTeamInviteMock
}));

describe("POST /api/v1/teams/[teamId]/invites/[inviteId]/revoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes an invite for the current captain", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    revokeTeamInviteMock.mockResolvedValue(undefined);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/teams/team-1/invites/inv-1/revoke", {
        method: "POST"
      }),
      {
        params: Promise.resolve({ teamId: "team-1", inviteId: "inv-1" })
      }
    );
    const json = await response.json();

    expect(revokeTeamInviteMock).toHaveBeenCalledWith("team-1", "inv-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({
      team_id: "team-1",
      invite_id: "inv-1",
      revoked: true
    });
  });

  it("returns service errors as API responses", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    revokeTeamInviteMock.mockRejectedValue(new ApiError(403, "FORBIDDEN", "Captain permission is required."));

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/teams/team-1/invites/inv-1/revoke", {
        method: "POST"
      }),
      {
        params: Promise.resolve({ teamId: "team-1", inviteId: "inv-1" })
      }
    );
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toEqual({
      code: "FORBIDDEN",
      message: "Captain permission is required.",
      details: {}
    });
  });
});
