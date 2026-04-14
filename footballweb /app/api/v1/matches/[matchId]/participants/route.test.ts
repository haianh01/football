import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const listMatchParticipantsMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  listMatchParticipants: listMatchParticipantsMock
}));

describe("GET /api/v1/matches/[matchId]/participants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns match participants for current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    listMatchParticipantsMock.mockResolvedValue([{ id: "participant-1" }]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/matches/match-1/participants"), {
      params: Promise.resolve({ matchId: "match-1" })
    });
    const json = await response.json();

    expect(listMatchParticipantsMock).toHaveBeenCalledWith("match-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual([{ id: "participant-1" }]);
  });
});
