import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

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

for (const route of ["/", "/ofertas", "/ofertas/pan-artesanal", "/establecimientos", "/establecimientos/cafe-el-prado", "/como-funciona", "/negocios", "/nosotros", "/preguntas-frecuentes", "/contacto", "/negocios/unirse", "/mis-reservas", "/panel/inventario", "/admin", "/admin/solicitudes"]) {
  test(`accesibilidad de ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await revealAll(page);
    const result = await audit(page);
    expect(result.violations.map((violation) => ({ id: violation.id, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
  });
}

test("formulario accesible con foco contenido en el diálogo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/panel");
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  const result = await audit(page);
  expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
});
