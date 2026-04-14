import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const listMatchPostInvitationsMock = vi.fn();
const createMatchInvitationMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/matchmaking", () => ({
  listMatchPostInvitations: listMatchPostInvitationsMock,
  createMatchInvitation: createMatchInvitationMock
}));

describe("GET /api/v1/match-posts/[matchPostId]/invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns invitations visible to current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    listMatchPostInvitationsMock.mockResolvedValue([{ id: "inv-1" }]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/match-posts/post-1/invitations"), {
      params: Promise.resolve({ matchPostId: "post-1" })
    });
    const json = await response.json();

    expect(listMatchPostInvitationsMock).toHaveBeenCalledWith("post-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data.items).toEqual([{ id: "inv-1" }]);
  });
});

describe("POST /api/v1/match-posts/[matchPostId]/invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a match invitation for the current user", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    createMatchInvitationMock.mockResolvedValue({ id: "inv-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/match-posts/post-1/invitations", {
        method: "POST",
        body: JSON.stringify({ inviter_team_id: "team-2", note: "Bọn mình đá tối OK." })
      }),
      {
        params: Promise.resolve({ matchPostId: "post-1" })
      }
    );
    const json = await response.json();

    expect(createMatchInvitationMock).toHaveBeenCalledWith(
      {
        match_post_id: "post-1",
        inviter_team_id: "team-2",
        note: "Bọn mình đá tối OK."
      },
      "user-1"
    );
    expect(response.status).toBe(201);
    expect(json.data).toEqual({ id: "inv-1" });
  });
});
