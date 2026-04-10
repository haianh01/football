import { expect, test } from "@playwright/test";

test("captain can create team, create match post, and land on detail page", async ({ page }) => {
  const uniqueSuffix = Date.now().toString();
  const teamName = `FC E2E ${uniqueSuffix}`;
  const matchTitle = `Kèo E2E ${uniqueSuffix}`;

  await page.goto("/team/create");

  await page.getByLabel("Tên đội").fill(teamName);
  await page.getByLabel("Thành phố").fill("HCM");
  await page.getByLabel("Quận / khu vực").fill("Q7");
  await page.getByRole("button", { name: "Tạo đội và vào dashboard" }).click();

  await expect(page).toHaveURL(/\/team\/.+/);
  await expect(page.getByRole("link", { name: "Đăng kèo tìm đối" })).toBeVisible();

  await page.getByRole("link", { name: "Đăng kèo tìm đối" }).click();

  await expect(page).toHaveURL("/match/posts/create");
  await page.getByLabel("Tiêu đề").fill(matchTitle);
  await page.getByLabel("Ngày đá").fill("2026-04-12");
  await page.getByLabel("Giờ bắt đầu").fill("19:30");
  await page.getByLabel("Giờ kết thúc").fill("21:00");
  await page.getByLabel("Thành phố").fill("HCM");
  await page.getByLabel("Quận/Huyện").fill("Q7");
  await page.getByLabel("Sân cụ thể").fill("Sân Đại Nam");
  await page.getByLabel("Đội đăng").selectOption({ label: `${teamName} (captain)` });
  await page.getByRole("button", { name: "Đăng kèo ngay" }).click();

  await expect(page).toHaveURL(/\/match\/posts\/.+/);
  await expect(page.getByRole("heading", { name: matchTitle })).toBeVisible();
  await expect(page.getByText(`Đội đăng: ${teamName}`)).toBeVisible();
  await expect(page.getByText("Sân Đại Nam")).toBeVisible();
});
