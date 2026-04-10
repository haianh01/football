import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const getTeamDashboardMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  getTeamDashboard: getTeamDashboardMock
}));

describe("GET /api/v1/teams/[teamId]/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns team dashboard for current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    getTeamDashboardMock.mockResolvedValue({ team_summary: { id: "team-1" } });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/teams/team-1/dashboard"), {
      params: Promise.resolve({ teamId: "team-1" })
    });
    const json = await response.json();

    expect(getTeamDashboardMock).toHaveBeenCalledWith("team-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ team_summary: { id: "team-1" } });
  });
});
