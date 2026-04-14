import { expect, test } from "@playwright/test";

test("captain can receive and accept a match invitation from another team", async ({ browser, page }) => {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const teamAName = `FC Home ${uniqueSuffix}`;
  const teamBName = `FC Challenger ${uniqueSuffix}`;
  const matchTitle = `Kèo Invite ${uniqueSuffix}`;
  const user2Email = `challenger-${uniqueSuffix}@vpitch.local`;

  await page.goto("/");

  const teamAPayload = await page.evaluate(async ({ teamAName }) => {
    const response = await fetch("/api/v1/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: teamAName,
        skill_level_code: "L3_INTERMEDIATE",
        home_city_code: "HCM",
        home_district_code: "Q7"
      })
    });

    return response.json();
  }, { teamAName });

  const teamAId = teamAPayload.data.team.id as string;
  const matchPostPayload = await page.evaluate(async ({ matchTitle, teamAId }) => {
    const response = await fetch("/api/v1/match-posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        team_id: teamAId,
        title: matchTitle,
        match_type: "friendly",
        urgency: "normal",
        date: "2099-04-18",
        start_time: "19:30",
        end_time: "21:00",
        city_code: "HCM",
        district_code: "Q7",
        venue_name: "Sân Đại Nam",
        field_type: "seven",
        team_skill_min: "L2_RECREATIONAL",
        team_skill_max: "L4_ADVANCED",
        pitch_fee_rule: "share"
      })
    });

    return response.json();
  }, { matchTitle, teamAId });

  const matchPostUrl = `/match/posts/${matchPostPayload.data.id as string}`;

  const user2Context = await browser.newContext({
    extraHTTPHeaders: {
      "x-demo-user-email": user2Email
    }
  });

  const user2Page = await user2Context.newPage();
  await user2Page.goto("/");

  const teamBPayload = await user2Page.evaluate(async ({ teamBName }) => {
    const response = await fetch("/api/v1/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: teamBName,
        skill_level_code: "L3_INTERMEDIATE",
        home_city_code: "HCM",
        home_district_code: "Q1"
      })
    });

    return response.json();
  }, { teamBName });

  const teamBId = teamBPayload.data.team.id as string;
  await user2Page.goto(`/team/${teamBId}`);
  await expect(user2Page.getByRole("heading", { name: teamBName })).toBeVisible();

  await user2Page.goto(matchPostUrl);
  await user2Page.getByPlaceholder("Ghi chú ngắn cho đội đăng kèo...").fill("Đội mình đá tối được.");
  await Promise.all([
    user2Page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes(`/api/v1/match-posts/${matchPostPayload.data.id as string}/invitations`) &&
        response.ok()
    ),
    user2Page.getByRole("button", { name: "Gửi lời mời chốt kèo" }).click()
  ]);

  await expect(user2Page.getByText("pending_confirmation")).toBeVisible();

  await page.goto(`/team/${teamAId}`);
  await expect(page.getByText("1 pending")).toBeVisible();
  await expect(page.getByText(`${teamBName} gửi lời mời cho ${matchTitle}`)).toBeVisible();
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/api\/v1\/match-invitations\/.+\/accept$/.test(response.url()) &&
        response.ok()
    ),
    page.getByRole("button", { name: "Chấp nhận" }).first().click()
  ]);

  await expect(page.getByText("0 pending")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trận đã chốt" })).toBeVisible();
  await expect(page.getByText(`vs ${teamBName}`)).toBeVisible();

  await page.goto(matchPostUrl);
  await expect(page.getByText("matched", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kèo đã chốt" })).toBeVisible();
  await expect(page.getByText(`${teamAName} vs ${teamBName}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`${teamBName} muốn chốt kèo`)).toBeVisible();
  await expect(page.getByText("accepted")).toBeVisible();

  await user2Page.goto(matchPostUrl);
  await user2Page.getByRole("link", { name: "Xem trận đã chốt" }).click();

  await expect(user2Page).toHaveURL(/\/matches\/.+/);
  await expect(user2Page.getByText("0 confirmed • 2 pending")).toBeVisible();
  await Promise.all([
    user2Page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        /\/api\/v1\/matches\/.+\/participants\/.+$/.test(response.url()) &&
        response.ok()
    ),
    user2Page.getByRole("button", { name: "Xác nhận tham gia" }).click()
  ]);
  await expect(user2Page.getByText("1 confirmed • 1 pending")).toBeVisible();
  await expect(user2Page.getByText("captain • confirmed")).toBeVisible();

  await user2Context.close();
});
