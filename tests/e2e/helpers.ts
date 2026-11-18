import { expect, type Page } from "@playwright/test";

/** Initial accounts loaded by scripts/db-seed.ts (password: SEED_PASSWORD in src/lib/seed.ts). */
export const ACCOUNTS = {
  customer: "ana.rojas@correo.bo",
  business: "laespiga@ecorescate.bo",
  admin: "admin@ecorescate.bo",
} as const;
export const PASSWORD = "Rescate2026";

/** Signs in through the real form, replacing any previous session. */
export async function signIn(page: Page, email: string, next = "/") {
  await page.context().clearCookies();
  await page.goto(`/ingresar?next=${encodeURIComponent(next)}`);
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(PASSWORD);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).not.toHaveURL(/\/ingresar/);
}
