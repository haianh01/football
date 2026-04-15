import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const parseUpdateMatchParticipantStatsInputMock = vi.fn();
const updateMatchParticipantStatsMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  parseUpdateMatchParticipantStatsInput: parseUpdateMatchParticipantStatsInputMock,
  updateMatchParticipantStats: updateMatchParticipantStatsMock
}));

describe("PATCH /api/v1/matches/[matchId]/participants/[participantId]/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates participant stats", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseUpdateMatchParticipantStatsInputMock.mockReturnValue({ goals: 2, assists: 1, is_mvp: true });
    updateMatchParticipantStatsMock.mockResolvedValue({
      id: "participant-1",
      goals: 2,
      assists: 1,
      is_mvp: true
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/matches/match-1/participants/participant-1/stats", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goals: 2,
          assists: 1,
          is_mvp: true
        })
      }),
      {
        params: Promise.resolve({ matchId: "match-1", participantId: "participant-1" })
      }
    );
    const json = await response.json();

    expect(parseUpdateMatchParticipantStatsInputMock).toHaveBeenCalledWith({
      goals: 2,
      assists: 1,
      is_mvp: true
    });
    expect(updateMatchParticipantStatsMock).toHaveBeenCalledWith(
      "match-1",
      "participant-1",
      { goals: 2, assists: 1, is_mvp: true },
      "user-1"
    );
    expect(response.status).toBe(200);
    expect(json.data).toEqual({
      id: "participant-1",
      goals: 2,
      assists: 1,
      is_mvp: true
    });
  });
});
