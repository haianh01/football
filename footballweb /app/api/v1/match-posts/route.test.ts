import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const listMatchPostsMock = vi.fn();
const parseCreateMatchPostInputMock = vi.fn();
const createMatchPostMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  listMatchPosts: listMatchPostsMock,
  parseCreateMatchPostInput: parseCreateMatchPostInputMock,
  createMatchPost: createMatchPostMock
}));

describe("GET /api/v1/match-posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes search filters into service", async () => {
    listMatchPostsMock.mockResolvedValue([{ id: "post-1" }]);

    const request = new Request(
      "http://localhost:3000/api/v1/match-posts?q=warriors&city_code=HCM&field_type=seven&status=open"
    );

    const { GET } = await import("./route");
    const response = await GET(request);
    const json = await response.json();

    expect(listMatchPostsMock).toHaveBeenCalledWith({
      q: "warriors",
      city_code: "HCM",
      status: "open",
      field_type: "seven"
    });
    expect(response.status).toBe(200);
    expect(json.data).toEqual([{ id: "post-1" }]);
  });
});

describe("POST /api/v1/match-posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a match post for current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseCreateMatchPostInputMock.mockReturnValue({ team_id: "team-1" });
    createMatchPostMock.mockResolvedValue({ id: "post-1" });

    const request = new Request("http://localhost:3000/api/v1/match-posts", {
      method: "POST",
      body: JSON.stringify({ team_id: "team-1" }),
      headers: {
        "content-type": "application/json"
      }
    });

    const { POST } = await import("./route");
    const response = await POST(request);
    const json = await response.json();

    expect(createMatchPostMock).toHaveBeenCalledWith({ team_id: "team-1" }, "user-1");
    expect(response.status).toBe(201);
    expect(json.data).toEqual({ id: "post-1" });
  });
});
