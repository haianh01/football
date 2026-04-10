import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const getTeamDetailMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  getTeamDetail: getTeamDetailMock
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
});
