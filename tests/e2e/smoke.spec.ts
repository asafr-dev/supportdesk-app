import { test, expect } from "@playwright/test";
import { DEMO_AGENT_EMAIL, requireDemoPassword } from "../../src/lib/demo";

const demoPassword = requireDemoPassword();

test("login and view tickets", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toHaveValue(DEMO_AGENT_EMAIL);
  await expect(page.getByLabel("Password")).toHaveValue(demoPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/tickets");
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Tickets", exact: true })
  ).toBeVisible();
});
