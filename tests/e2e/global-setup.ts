import { execFileSync } from "node:child_process";

/**
 * Reloads the sample data so every run starts from the same offers and reservations.
 * WARNING: this replaces offers, reservations and establishments in the connected database.
 * Skip it with E2E_RESEED=0 (e.g. when PLAYWRIGHT_BASE_URL points to a site with real data).
 */
export default function globalSetup() {
  if (process.env.E2E_RESEED === "0") return;
  execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "scripts/db-seed.ts"], { stdio: "inherit" });
}
