import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

for (const route of ["/", "/ofertas", "/ofertas/pan-artesanal", "/establecimiento/inventario", "/admin", "/proyecto"]) {
  test(`accesibilidad de ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(result.violations.map((violation) => ({ id: violation.id, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
  });
}

test("formulario accesible con foco contenido en el diálogo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/establecimiento");
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
});
