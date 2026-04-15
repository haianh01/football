import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const getTeamDetailMock = vi.fn();
const parseUpdateTeamInputMock = vi.fn();
const updateTeamMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  getTeamDetail: getTeamDetailMock,
  parseUpdateTeamInput: parseUpdateTeamInputMock,
  updateTeam: updateTeamMock
}));

describe("GET /api/v1/teams/[teamId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns team detail for current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    getTeamDetailMock.mockResolvedValue({ id: "team-1", name: "FC Warriors" });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/teams/team-1"), {
      params: Promise.resolve({ teamId: "team-1" })
    });
    const json = await response.json();

    expect(getTeamDetailMock).toHaveBeenCalledWith("team-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "team-1", name: "FC Warriors" });
  });

  it("updates team detail for captain", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseUpdateTeamInputMock.mockReturnValue({ name: "FC Updated" });
    updateTeamMock.mockResolvedValue({ id: "team-1", name: "FC Updated" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/teams/team-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "FC Updated"
        })
      }),
      {
        params: Promise.resolve({ teamId: "team-1" })
      }
    );
    const json = await response.json();

    expect(parseUpdateTeamInputMock).toHaveBeenCalledWith({ name: "FC Updated" });
    expect(updateTeamMock).toHaveBeenCalledWith("team-1", "user-1", { name: "FC Updated" });
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "team-1", name: "FC Updated" });
  });
});
