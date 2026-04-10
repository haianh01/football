import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const listTeamInvitesMock = vi.fn();
const createTeamInviteMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-management/service", () => ({
  listTeamInvites: listTeamInvitesMock,
  createTeamInvite: createTeamInviteMock
}));

describe("GET /api/v1/teams/[teamId]/invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns invites list for captain", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    listTeamInvitesMock.mockResolvedValue([{ id: "inv-1", invite_code: "VPINV-AAA" }]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/teams/team-1/invites"), {
      params: Promise.resolve({ teamId: "team-1" })
    });
    const json = await response.json();

    expect(listTeamInvitesMock).toHaveBeenCalledWith("team-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data.items).toEqual([{ id: "inv-1", invite_code: "VPINV-AAA" }]);
  });
});

describe("POST /api/v1/teams/[teamId]/invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an invite", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    createTeamInviteMock.mockResolvedValue({ id: "inv-1", invite_code: "VPINV-AAA" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/v1/teams/team-1/invites", {
        method: "POST",
        body: JSON.stringify({ expires_in_days: 7 })
      }),
      { params: Promise.resolve({ teamId: "team-1" }) }
    );
    const json = await response.json();

    expect(createTeamInviteMock).toHaveBeenCalledWith("team-1", "user-1", { expiresInDays: 7 });
    expect(response.status).toBe(201);
    expect(json.data.invite).toEqual({ id: "inv-1", invite_code: "VPINV-AAA" });
  });
});

