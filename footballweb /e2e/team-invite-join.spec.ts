import { expect, test } from "@playwright/test";

test("captain can create invite and another user can join team", async ({ browser, page }) => {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const teamName = `FC E2E ${uniqueSuffix}`;
  const user2Email = `player2-${uniqueSuffix}@vpitch.local`;

  await page.goto("/team/create");

  await page.getByLabel("Tên đội").fill(teamName);
  await page.getByLabel("Thành phố").fill("HCM");
  await page.getByLabel("Quận / khu vực").fill("Q7");
  await page.getByRole("button", { name: "Tạo đội và vào dashboard" }).click();

  await expect(page).toHaveURL(/\/team\/.+/);

  await page.getByRole("button", { name: "Tạo mã mời" }).click();

  await expect(page.getByLabel("Mã mời").first()).toBeVisible();
  const inviteCode = (await page.getByLabel("Mã mời").first().inputValue()).trim();
  expect(inviteCode).toMatch(/^VPINV-/);

  const user2Context = await browser.newContext({
    extraHTTPHeaders: {
      "x-demo-user-email": user2Email
    }
  });

  const user2Page = await user2Context.newPage();
  await user2Page.goto(`/team/join?code=${encodeURIComponent(inviteCode)}`);
  await user2Page.getByRole("button", { name: "Join ngay" }).click();

  await expect(user2Page).toHaveURL(/\/team\/.+/);
  await expect(user2Page.getByText("2 records")).toBeVisible();

  await page.reload();
  await expect(page.getByText("2 records")).toBeVisible();

  await user2Context.close();
});

