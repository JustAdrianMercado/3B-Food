import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { ACCOUNTS, signIn } from "./helpers";

/** Scroll through the page so every scroll-triggered reveal has finished before auditing. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await pause(120);
    }
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLElement>("main *")].filter((element) => element.style.opacity !== "" && element.style.opacity !== "1").length)).toBe(0);
}

const audit = (page: Page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
const violations = (result: Awaited<ReturnType<typeof audit>>) => result.violations.map((violation) => ({ id: violation.id, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }));

const routes: [string, keyof typeof ACCOUNTS | null][] = [
  ["/", null], ["/ofertas", null], ["/ofertas/pan-artesanal", null], ["/establecimientos", null], ["/establecimientos/cafe-el-prado", null],
  ["/como-funciona", null], ["/negocios", null], ["/nosotros", null], ["/preguntas-frecuentes", null], ["/contacto", null], ["/negocios/unirse", null],
  ["/ingresar", null], ["/registro", null], ["/mis-reservas", "customer"], ["/panel/inventario", "business"], ["/panel/historial", "business"],
  ["/admin", "admin"], ["/admin/usuarios", "admin"],
];

for (const [route, account] of routes) {
  test(`accesibilidad de ${route}`, async ({ page }) => {
    if (account) await signIn(page, ACCOUNTS[account], route);
    await page.goto(route, { waitUntil: "networkidle" });
    await revealAll(page);
    expect(violations(await audit(page))).toEqual([]);
  });
}

test("formulario accesible con foco contenido en el diálogo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, ACCOUNTS.business, "/panel");
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  expect(violations(await audit(page))).toEqual([]);
});
