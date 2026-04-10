import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/http";

const requireCurrentUserMock = vi.fn();
const listTeamsForUserMock = vi.fn();
const parseCreateTeamInputMock = vi.fn();
const createTeamMock = vi.fn();
const getTeamDetailMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  listTeamsForUser: listTeamsForUserMock,
  parseCreateTeamInput: parseCreateTeamInputMock,
  createTeam: createTeamMock,
  getTeamDetail: getTeamDetailMock
}));

describe("GET /api/v1/teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated team list", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    listTeamsForUserMock.mockResolvedValue([{ id: "team-1", name: "FC Warriors" }]);

    const { GET } = await import("./route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.items).toEqual([{ id: "team-1", name: "FC Warriors" }]);
    expect(json.data.current_user_id).toBe("user-1");
  });

  it("returns api error when auth fails", async () => {
    requireCurrentUserMock.mockRejectedValue(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));

    const { GET } = await import("./route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/v1/teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates team and returns team payload", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseCreateTeamInputMock.mockReturnValue({ name: "FC Warriors", skill_level_code: "L3_INTERMEDIATE" });
    createTeamMock.mockResolvedValue({ id: "team-1" });
    getTeamDetailMock.mockResolvedValue({
      id: "team-1",
      name: "FC Warriors",
      slug: "fc-warriors",
      role_of_current_user: "captain"
    });

    const request = new Request("http://localhost:3000/api/v1/teams", {
      method: "POST",
      body: JSON.stringify({ name: "FC Warriors" }),
      headers: {
        "content-type": "application/json"
      }
    });

    const { POST } = await import("./route");
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.team).toEqual({
      id: "team-1",
      name: "FC Warriors",
      slug: "fc-warriors",
      role_of_current_user: "captain"
    });
  });
});
