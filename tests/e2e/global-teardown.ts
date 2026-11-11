import { execFileSync } from "node:child_process";

/** Removes the form submissions created by the end-to-end tests (marked with E2E_MARKER). */
export default function globalTeardown() {
  if (process.env.E2E_RESEED === "0") return;
  execFileSync(process.execPath, ["--env-file=.env.local", "--import", "tsx", "scripts/db-clean-e2e.ts"], { stdio: "inherit" });
}
