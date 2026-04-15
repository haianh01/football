import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const sendTeamFeeCollectionRequestsMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-finance", () => ({
  sendTeamFeeCollectionRequests: sendTeamFeeCollectionRequestsMock
}));

describe("POST /api/v1/team-fees/[feeId]/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends fee collection requests", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    sendTeamFeeCollectionRequestsMock.mockResolvedValue({ id: "fee-1", last_requested_at: "2026-04-15T12:00:00.000Z" });

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost:3000/api/v1/team-fees/fee-1/requests", { method: "POST" }), {
      params: Promise.resolve({ feeId: "fee-1" })
    });
    const json = await response.json();

    expect(sendTeamFeeCollectionRequestsMock).toHaveBeenCalledWith("fee-1", "user-1");
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "fee-1", last_requested_at: "2026-04-15T12:00:00.000Z" });
  });
});
