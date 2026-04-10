import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamMemberStatus, TeamRole } from "@prisma/client";

import { ApiError } from "@/lib/http";

const dbMock = {
  team: {
    findUnique: vi.fn(),
    create: vi.fn()
  },
  teamMember: {
    create: vi.fn()
  },
  $transaction: vi.fn()
};

vi.mock("@/lib/db", () => ({
  db: dbMock
}));

describe("team-management/createTeam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a team and captain membership", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("abcd1234-abcd-1234-abcd-1234567890ab");

    dbMock.team.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    dbMock.$transaction.mockImplementation(async (callback: (tx: typeof dbMock) => Promise<unknown>) => callback(dbMock));

    dbMock.team.create.mockResolvedValue({
      id: "team-1",
      name: "FC Warriors",
      slug: "fc-warriors",
      short_code: "VP-ABCD1234"
    });

    dbMock.teamMember.create.mockResolvedValue({
      id: "member-1"
    });

    const { createTeam } = await import("./service");

    const result = await createTeam(
      {
        name: "FC Warriors",
        skill_level_code: "L3_INTERMEDIATE"
      },
      "user-1"
    );

    expect(dbMock.team.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "FC Warriors",
        slug: "fc-warriors",
        short_code: "VP-ABCD1234",
        created_by: "user-1"
      })
    });

    expect(dbMock.teamMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        team_id: "team-1",
        user_id: "user-1",
        role: TeamRole.captain,
        status: TeamMemberStatus.active
      })
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "team-1",
        name: "FC Warriors"
      })
    );
  });

  it("throws when unique slug cannot be generated", async () => {
    dbMock.team.findUnique.mockResolvedValue({ id: "existing-team" });

    const { createTeam } = await import("./service");

    await expect(
      createTeam(
        {
          name: "FC Warriors",
          skill_level_code: "L3_INTERMEDIATE"
        },
        "user-1"
      )
    ).rejects.toBeInstanceOf(ApiError);
  });
});
