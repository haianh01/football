import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const parseCreateTeamInputMock = vi.fn();
const createTeamMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("./service", () => ({
  parseCreateTeamInput: parseCreateTeamInputMock,
  createTeam: createTeamMock
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

describe("createTeamAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates team and redirects to dashboard", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseCreateTeamInputMock.mockReturnValue({
      name: "FC Warriors",
      skill_level_code: "L3_INTERMEDIATE",
      logo_url: undefined
    });
    createTeamMock.mockResolvedValue({ id: "team-1" });

    const formData = new FormData();
    formData.set("name", "FC Warriors");
    formData.set("skill_level_code", "L3_INTERMEDIATE");

    const { createTeamAction } = await import("./actions");
    await createTeamAction(formData);

    expect(createTeamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "FC Warriors"
      }),
      "user-1"
    );
    expect(redirectMock).toHaveBeenCalledWith("/team/team-1");
  });
});
