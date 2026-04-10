import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const dbMock = {
  userPreference: {
    findUnique: vi.fn()
  }
};

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/lib/db", () => ({
  db: dbMock
}));

describe("GET /api/v1/users/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns current user profile", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-1",
      display_name: "Captain",
      avatar_url: null,
      preferred_locale: "vi-VN",
      timezone: "Asia/Ho_Chi_Minh"
    });

    dbMock.userPreference.findUnique.mockResolvedValue({
      spoken_languages: ["vi", "en"]
    });

    const { GET } = await import("./route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual({
      id: "user-1",
      display_name: "Captain",
      avatar_url: null,
      preferred_locale: "vi-VN",
      timezone: "Asia/Ho_Chi_Minh",
      spoken_languages: ["vi", "en"]
    });
  });
});
