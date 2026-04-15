import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserMock = vi.fn();
const updateTeamFeeAssigneePaymentStatusMock = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: requireCurrentUserMock
}));

vi.mock("@/features/team-finance", () => ({
  updateTeamFeeAssigneePaymentStatus: updateTeamFeeAssigneePaymentStatusMock
}));

describe("PATCH /api/v1/team-fees/[feeId]/assignees/[assigneeId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates assignee payment status", async () => {
    requireCurrentUserMock.mockResolvedValue({ id: "user-1" });
    updateTeamFeeAssigneePaymentStatusMock.mockResolvedValue({ id: "fee-1", status: "paid" });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/team-fees/fee-1/assignees/assignee-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payment_status: "paid"
        })
      }),
      {
        params: Promise.resolve({ feeId: "fee-1", assigneeId: "assignee-1" })
      }
    );
    const json = await response.json();

    expect(updateTeamFeeAssigneePaymentStatusMock).toHaveBeenCalledWith("fee-1", "assignee-1", "user-1", {
      payment_status: "paid"
    });
    expect(response.status).toBe(200);
    expect(json.data).toEqual({ id: "fee-1", status: "paid" });
  });
});
