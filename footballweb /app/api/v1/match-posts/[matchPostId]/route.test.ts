import { beforeEach, describe, expect, it, vi } from "vitest";

const getMatchPostDetailMock = vi.fn();

vi.mock("@/features/matchmaking", () => ({
  getMatchPostDetail: getMatchPostDetailMock
}));

describe("GET /api/v1/match-posts/[matchPostId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns match post detail", async () => {
    getMatchPostDetailMock.mockResolvedValue({ id: "post-1", title: "Kèo tối thứ 7" });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/v1/match-posts/post-1"), {
      params: Promise.resolve({ matchPostId: "post-1" })
    });
    const json = await response.json();

    expect(getMatchPostDetailMock).toHaveBeenCalledWith("post-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "post-1", title: "Kèo tối thứ 7" });
  });
});
