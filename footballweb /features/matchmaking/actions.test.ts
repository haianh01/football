import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const parseCreateMatchPostInputMock = vi.fn();
const createMatchPostMock = vi.fn();
const redirectMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("./service", () => ({
  parseCreateMatchPostInput: parseCreateMatchPostInputMock,
  createMatchPost: createMatchPostMock
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

describe("createMatchPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates match post, revalidates pages and redirects", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    parseCreateMatchPostInputMock.mockReturnValue({
      team_id: "team-1"
    });
    createMatchPostMock.mockResolvedValue({ id: "post-1" });

    const formData = new FormData();
    formData.set("team_id", "team-1");

    const { createMatchPostAction } = await import("./actions");
    await createMatchPostAction(formData);

    expect(createMatchPostMock).toHaveBeenCalledWith({ team_id: "team-1" }, "user-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/match/posts");
    expect(revalidatePathMock).toHaveBeenCalledWith("/match/posts/post-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/team/team-1");
    expect(redirectMock).toHaveBeenCalledWith("/match/posts/post-1");
  });
});
