import { beforeEach, describe, expect, it, vi } from "vitest";

const getMatchDetailMock = vi.fn();
const requireCurrentUserMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  getMatchDetail: getMatchDetailMock
}));

describe("GET /api/v1/matches/[matchId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns match detail", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    getMatchDetailMock.mockResolvedValue({ id: "match-1", status: "scheduled" });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/matches/match-1"), {
      params: Promise.resolve({ matchId: "match-1" })
    });
    const json = await response.json();

    expect(getMatchDetailMock).toHaveBeenCalledWith("match-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "match-1", status: "scheduled" });
  });
});
