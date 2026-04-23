import { expect, test } from "@playwright/test";

const hasAuthEnv = Boolean(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD);

test.describe("authenticated workspace smoke", () => {
  test.skip(
    !hasAuthEnv,
    "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated Phase E smoke tests.",
  );

  test("verified user can sign in, open navigation, and reach settings", async ({ page }) => {
    await page.goto("/auth?mode=signin");

    await page.getByTestId("auth-signin-email").fill(process.env.E2E_TEST_EMAIL ?? "");
    await page.getByTestId("auth-signin-password").fill(process.env.E2E_TEST_PASSWORD ?? "");
    await page.getByTestId("auth-signin-submit").click();

    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60_000 });

    if (page.url().includes("/onboarding")) {
      await expect(page.getByTestId("onboarding-shell")).toBeVisible();
      return;
    }

    await expect(page.getByTestId("dashboard-shell")).toBeVisible();
    await expect(page.getByTestId("dashboard-next-action")).toBeVisible();

    await page.getByTestId("profile-menu-trigger").click();
    await expect(page.getByTestId("profile-menu-content")).toBeVisible();

    await page.getByTestId("profile-menu-settings").click();
    await expect(page).toHaveURL(/\/settings\?section=settings/);
    await expect(page.getByTestId("settings-shell")).toBeVisible();
  });
});
