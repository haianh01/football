import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const updateMatchParticipantAttendanceMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  updateMatchParticipantAttendance: updateMatchParticipantAttendanceMock
}));

describe("PATCH /api/v1/matches/[matchId]/participants/[participantId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates participant attendance", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    updateMatchParticipantAttendanceMock.mockResolvedValue({ id: "participant-1", attendance_status: "confirmed" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/matches/match-1/participants/participant-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attendance_status: "confirmed"
        })
      }),
      {
        params: Promise.resolve({ matchId: "match-1", participantId: "participant-1" })
      }
    );
    const json = await response.json();

    expect(updateMatchParticipantAttendanceMock).toHaveBeenCalledWith("match-1", "participant-1", "confirmed", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "participant-1", attendance_status: "confirmed" });
  });

  it("accepts checked_in as a valid attendance status", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    updateMatchParticipantAttendanceMock.mockResolvedValue({ id: "participant-1", attendance_status: "checked_in" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/matches/match-1/participants/participant-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attendance_status: "checked_in"
        })
      }),
      {
        params: Promise.resolve({ matchId: "match-1", participantId: "participant-1" })
      }
    );
    const json = await response.json();

    expect(updateMatchParticipantAttendanceMock).toHaveBeenCalledWith("match-1", "participant-1", "checked_in", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "participant-1", attendance_status: "checked_in" });
  });

  it("returns 400 for invalid attendance status", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/matches/match-1/participants/participant-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attendance_status: "unknown_status"
        })
      }),
      {
        params: Promise.resolve({ matchId: "match-1", participantId: "participant-1" })
      }
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.message).toContain("attendance_status");
  });
});
