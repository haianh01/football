import { beforeEach, describe, expect, it, vi } from "vitest";

const getMatchDetailMock = vi.fn();
const parseUpdateMatchInputMock = vi.fn();
const requireCurrentUserMock = vi.fn();
const updateMatchMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  getMatchDetail: getMatchDetailMock,
  parseUpdateMatchInput: parseUpdateMatchInputMock,
  updateMatch: updateMatchMock
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

  it("updates match detail", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseUpdateMatchInputMock.mockReturnValue({ status: "completed", home_score: 3, away_score: 1 });
    updateMatchMock.mockResolvedValue({ id: "match-1", status: "completed", home_score: 3, away_score: 1 });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/matches/match-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "completed",
          home_score: 3,
          away_score: 1
        })
      }),
      {
        params: Promise.resolve({ matchId: "match-1" })
      }
    );
    const json = await response.json();

    expect(parseUpdateMatchInputMock).toHaveBeenCalledWith({
      status: "completed",
      home_score: 3,
      away_score: 1
    });
    expect(updateMatchMock).toHaveBeenCalledWith("match-1", "user-1", {
      status: "completed",
      home_score: 3,
      away_score: 1
    });
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "match-1", status: "completed", home_score: 3, away_score: 1 });
  });
});
