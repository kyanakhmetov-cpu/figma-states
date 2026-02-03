import { test, expect } from "@playwright/test";
import path from "path";

test("create element, add state, reload persists", async ({ page }) => {
  const uploadPath = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "sample-element.svg",
  );

  await page.goto("/");
  await page.getByLabel("Figma link").fill(
    "https://www.figma.com/file/AbCdEFg12345/Design-System?node-id=120%3A880",
  );
  await page.setInputFiles('input[type="file"]', uploadPath);
  await page.getByRole("button", { name: "Create element" }).click();

  await page.waitForURL(/\/e\/.+/);
  await page.getByRole("button", { name: "Add state" }).click();

  const message = page.getByLabel("State message").first();
  await message.fill("Password can't be empty.");

  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  await page.reload();
  await page.waitForURL(/\/e\/.+/);

  const messageAfter = page.getByLabel("State message").first();
  await expect(messageAfter).toHaveValue("Password can't be empty.");
});
