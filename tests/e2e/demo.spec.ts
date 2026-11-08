import { test, expect } from "@playwright/test";

for (const viewport of [{ name: "escritorio", width: 1440, height: 1000 }, { name: "móvil", width: 390, height: 844 }]) {
  test(`publicar → reservar → recargar → retirar → reportar en ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const title = `Pack para exposición ${viewport.name}`;
    await page.goto("/establecimiento");
    await page.getByRole("button", { name: "Publicar excedente" }).click();
    await page.getByLabel("Nombre del producto o paquete").fill(title);
    await page.getByLabel("Descripción y conservación").fill("Seis panes de la producción del día. Conservar en un lugar fresco y seco. Contiene gluten.");
    await page.getByLabel("Cantidad de excedente").fill("3");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Registrar y publicar oferta" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto("/ofertas");
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("button", { name: "Reservar esta oportunidad" }).click();
    await page.getByRole("button", { name: "Confirmar reserva", exact: true }).click();
    const code = (await page.locator(".reservation-code").innerText()).trim();
    expect(code).toMatch(/^ECO-[A-F0-9]{6}$/);
    await page.getByRole("link", { name: "Ir a mis reservas" }).click();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toBeVisible();
    await page.goto("/establecimiento/reservas");
    await page.getByTestId("reservation-card").filter({ hasText: code }).getByRole("button", { name: "Confirmar retiro", exact: true }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("dialog").getByRole("button", { name: "Confirmar retiro", exact: true }).click();
    await page.getByRole("button", { name: /^Historial/ }).click();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toContainText("Retirada");
    await page.goto("/admin");
    const report = page.getByRole("table", { name: /Cantidades publicadas/ });
    await expect(report.getByRole("row").filter({ hasText: "unidades" })).toContainText("33");
    await expect(report.getByRole("row").filter({ hasText: "kg" })).toBeVisible();
    await expect(page.getByText("Datos simulados.", { exact: false }).last()).toBeVisible();
  });
}

test("cancelar devuelve las existencias y conserva la reserva en el historial", async ({ page }) => {
  await page.goto("/ofertas/pan-artesanal");
  await page.getByRole("button", { name: "Reservar esta oportunidad" }).click();
  await page.getByRole("button", { name: "Confirmar reserva", exact: true }).click();
  const code = (await page.locator(".reservation-code").innerText()).trim();
  await page.getByRole("link", { name: "Ir a mis reservas" }).click();
  await page.getByTestId("reservation-card").filter({ hasText: code }).getByRole("button", { name: "Cancelar reserva" }).click();
  await page.getByRole("button", { name: "Sí, cancelar reserva" }).click();
  await page.getByRole("button", { name: /^Historial/ }).click();
  await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toContainText("Cancelada");
  await page.goto("/ofertas/pan-artesanal");
  await expect(page.getByText(/9 unidades disponibles/)).toBeVisible();
});

test("los filtros combinados y el menú móvil funcionan", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ofertas");
  await expect(page.getByTestId("offer-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Panadería", exact: true }).click();
  await expect(page.getByTestId("offer-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page.getByLabel("Filtrar por zona").selectOption("Centro");
  await expect(page.getByText("Hoy no encontramos esa combinación")).toBeVisible();
  await page.getByRole("button", { name: "Ver todas las categorías" }).click();
  await expect(page.getByTestId("offer-card")).toHaveCount(6);
  await page.getByLabel("Buscar alimentos o establecimientos").fill("yogurt");
  await expect(page.getByTestId("offer-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByLabel("Vista de demostración").selectOption("admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("De las oportunidades");
});

test("un diálogo admite teclado y devuelve el foco al cerrar", async ({ page }) => {
  await page.goto("/establecimiento");
  const trigger = page.getByRole("button", { name: "Publicar excedente" });
  await trigger.click();
  await expect(page.getByLabel("Nombre del producto o paquete")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("el reporte se descarga como CSV con marca de demostración", async ({ page }) => {
  await page.goto("/admin");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const result = await download;
  expect(result.suggestedFilename()).toMatch(/^ecorescate-demo-.*\.csv$/);
  const stream = await result.createReadStream();
  let content = "";
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain("Datos simulados");
  expect(content).toContain('"kg"');
});

test("recupera datos incompatibles y permite restablecer los ejemplos", async ({ page }) => {
  await page.goto("/ofertas");
  await expect(page.getByTestId("offer-card")).toHaveCount(6);
  await page.evaluate(() => localStorage.setItem("ecorescate-demo-v1", '{"version":99}'));
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Recuperamos los ejemplos" })).toBeVisible();
  await page.getByRole("button", { name: "Restablecer demo", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Restablecer demo", exact: true }).click();
  await page.goto("/ofertas");
  await expect(page.getByTestId("offer-card")).toHaveCount(6);
});

for (const width of [320, 360, 390, 768, 1024, 1440]) {
  test(`no hay desbordamiento horizontal a ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/ofertas", "/ofertas/pan-artesanal", "/mis-reservas", "/establecimiento", "/establecimiento/inventario", "/establecimiento/reservas", "/establecimiento/reportes", "/admin", "/proyecto"]) {
      await test.step(route, async () => {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
  });
}

test("la PWA tiene iconos y ofrece una pantalla de desconexión", async ({ page, context, request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  try { await page.goto("/ofertas"); await expect(page.getByRole("heading", { level: 1 })).toContainText("Las cosas buenas"); await expect(page.getByText("No se procesan reservas reales sin conexión.")).toBeVisible(); }
  finally { await context.setOffline(false); }
});
