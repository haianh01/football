import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/http";

const requireCurrentUserMock = vi.fn();
const acceptTeamInviteMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  acceptTeamInvite: acceptTeamInviteMock
}));

describe("POST /api/v1/team-invites/accept", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts an invite for the current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    acceptTeamInviteMock.mockResolvedValue({ team_id: "team-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/team-invites/accept", {
        method: "POST",
        body: JSON.stringify({ invite_code: "VPINV-AAA" })
      })
    );
    const json = await response.json();

    expect(acceptTeamInviteMock).toHaveBeenCalledWith("VPINV-AAA", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ team_id: "team-1" });
  });

  it("returns service errors as API responses", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    acceptTeamInviteMock.mockRejectedValue(new ApiError(410, "GONE", "Invite has expired."));

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/team-invites/accept", {
        method: "POST",
        body: JSON.stringify({ invite_code: "VPINV-EXPIRED" })
      })
    );
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.error).toEqual({
      code: "GONE",
      message: "Invite has expired.",
      details: {}
    });
  });
});
