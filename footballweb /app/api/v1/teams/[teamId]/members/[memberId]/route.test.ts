import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const parseUpdateTeamMemberInputMock = vi.fn();
const updateTeamMemberMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  parseUpdateTeamMemberInput: parseUpdateTeamMemberInputMock,
  updateTeamMember: updateTeamMemberMock
}));

describe("PATCH /api/v1/teams/[teamId]/members/[memberId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates team member for current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseUpdateTeamMemberInputMock.mockReturnValue({ role: "treasurer" });
    updateTeamMemberMock.mockResolvedValue({ id: "member-1", role: "treasurer" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/teams/team-1/members/member-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: "treasurer"
        })
      }),
      {
        params: Promise.resolve({ teamId: "team-1", memberId: "member-1" })
      }
    );
    const json = await response.json();

    expect(parseUpdateTeamMemberInputMock).toHaveBeenCalledWith({ role: "treasurer" });
    expect(updateTeamMemberMock).toHaveBeenCalledWith("team-1", "member-1", "user-1", { role: "treasurer" });
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "member-1", role: "treasurer" });
  });
});
