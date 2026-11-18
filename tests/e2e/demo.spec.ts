import { test, expect, type Page } from "@playwright/test";
import { ACCOUNTS, signIn } from "./helpers";

/** Same marker as scripts/db-clean-e2e.ts, which deletes these records after the run. */
const E2E_MARKER = "Prueba automática E2E";

async function confirmReservation(page: Page) {
  await page.getByRole("button", { name: "Reservar esta oportunidad" }).click();
  await page.getByRole("button", { name: "Confirmar reserva", exact: true }).click();
  return (await page.locator(".reservation-code").innerText()).trim();
}

async function publish(page: Page, title: string) {
  await page.getByRole("button", { name: "Publicar excedente" }).click();
  await page.getByLabel("Nombre del producto o paquete").fill(title);
  await page.getByLabel("Categoría").selectOption("Panadería");
  await page.getByLabel("Qué incluye y cómo conservarlo").fill("Seis panes de la producción del día. Conservar en un lugar fresco y seco. Contiene gluten.");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Cantidad a publicar").fill("3");
  await page.getByLabel("Unidad").selectOption("unidades");
  await page.getByLabel("Precio habitual (Bs)").fill("30");
  await page.getByLabel("Precio de oferta (Bs)").fill("18");
  await expect(page.getByText("−40%")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Paso 5 de 5")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Publicar oferta" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

for (const viewport of [{ name: "escritorio", width: 1440, height: 1000 }, { name: "móvil", width: 390, height: 844 }]) {
  test(`publicar → reservar → recargar → retirar → reportar en ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const title = `Pack de prueba ${viewport.name} ${Date.now()}`;
    await signIn(page, ACCOUNTS.business, "/panel");
    await publish(page, title);

    await signIn(page, ACCOUNTS.customer, "/ofertas");
    await page.goto("/ofertas");
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    const code = await confirmReservation(page);
    expect(code).toMatch(/^ECO-[A-F0-9]{6}$/);
    await page.getByRole("link", { name: "Ir a mis reservas" }).click();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toBeVisible();

    await signIn(page, ACCOUNTS.business, "/panel/reservas");
    await page.goto("/panel/reservas");
    await page.getByTestId("reservation-card").filter({ hasText: code }).getByRole("button", { name: "Confirmar retiro", exact: true }).click();
    await page.getByRole("checkbox").check();
    await expect(page.getByRole("dialog")).toContainText("Ana Rojas");
    await page.getByRole("dialog").getByRole("button", { name: "Confirmar retiro", exact: true }).click();
    await page.getByRole("button", { name: /^Historial/ }).click();
    await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toContainText("Retirada");

    await signIn(page, ACCOUNTS.admin, "/admin");
    await page.goto("/admin");
    const report = page.getByRole("table", { name: /Cantidades publicadas/ });
    await expect(report.getByRole("row").filter({ hasText: "unidades" })).toBeVisible();
    await expect(report.getByRole("row").filter({ hasText: "kg" })).toBeVisible();
  });
}

test("reservar exige una cuenta de cliente", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/ofertas/pan-artesanal");
  await page.getByRole("button", { name: "Reservar esta oportunidad" }).click();
  await expect(page.getByRole("dialog")).toContainText("Ingresa para reservar");
  await page.getByRole("link", { name: "Ya tengo cuenta" }).click();
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fofertas%2Fpan-artesanal/);
  await signIn(page, ACCOUNTS.business, "/ofertas/pan-artesanal");
  await page.goto("/ofertas/pan-artesanal");
  await expect(page.getByRole("button", { name: "Reservas con cuenta de cliente" })).toBeDisabled();
});

test("cada rol solo entra a su espacio", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fpanel$/);
  await signIn(page, ACCOUNTS.customer, "/");
  await page.goto("/admin");
  await expect(page).toHaveURL(/acceso=administrador/);
  await expect(page.getByText("Esta sección requiere una cuenta de administración.")).toBeVisible();
  await signIn(page, ACCOUNTS.business, "/");
  await page.goto("/admin/usuarios");
  await expect(page).toHaveURL(/acceso=administrador/);
  await signIn(page, ACCOUNTS.admin, "/admin/usuarios");
  await page.goto("/admin/usuarios");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Usuarios y roles");
});

test("cancelar devuelve las existencias y conserva la reserva en el historial", async ({ page }) => {
  await signIn(page, ACCOUNTS.customer, "/ofertas/pan-artesanal");
  await page.goto("/ofertas/pan-artesanal");
  const before = Number((await page.getByText(/unidades disponibles/).first().innerText()).match(/(\d+) unidades disponibles/)![1]);
  const code = await confirmReservation(page);
  await page.getByRole("link", { name: "Ir a mis reservas" }).click();
  await page.getByTestId("reservation-card").filter({ hasText: code }).getByRole("button", { name: "Cancelar reserva" }).click();
  await page.getByRole("button", { name: "Sí, cancelar reserva" }).click();
  await page.getByRole("button", { name: /^Historial/ }).click();
  await expect(page.getByTestId("reservation-card").filter({ hasText: code })).toContainText("Cancelada");
  await page.goto("/ofertas/pan-artesanal");
  await expect(page.getByText(`${before} unidades disponibles`)).toBeVisible();
});

test("los filtros combinados y el menú móvil funcionan", async ({ page }) => {
  await page.context().clearCookies();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ofertas");
  const cards = page.getByTestId("offer-card");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThanOrEqual(18);
  await page.getByRole("button", { name: "Panadería", exact: true }).click();
  await expect.poll(() => cards.count()).toBeLessThan(total);
  expect(await cards.count()).toBeGreaterThanOrEqual(4);
  for (const card of await cards.all()) await expect(card).toContainText("Panadería");
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page.getByLabel("Filtrar por zona").selectOption("Centro");
  await expect(page.getByText("Hoy no encontramos esa combinación")).toBeVisible();
  await page.getByRole("button", { name: "Ver todas las categorías" }).click();
  await expect(cards).toHaveCount(total);
  await page.getByLabel("Buscar alimentos o establecimientos").fill("yogurt");
  await expect(page.getByTestId("offer-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("navigation", { name: "Menú móvil" }).getByRole("link", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/ingresar/);
});

test("un diálogo admite teclado y devuelve el foco al cerrar", async ({ page }) => {
  await signIn(page, ACCOUNTS.business, "/panel");
  const trigger = page.getByRole("button", { name: "Publicar excedente" });
  await trigger.click();
  await expect(page.getByLabel("Nombre del producto o paquete")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("el reporte se descarga como CSV separado por unidad", async ({ page }) => {
  await signIn(page, ACCOUNTS.admin, "/admin");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const result = await download;
  expect(result.suggestedFilename()).toMatch(/^ecorescate-reporte-.*\.csv$/);
  const stream = await result.createReadStream();
  let content = "";
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain("Reporte de aprovechamiento");
  expect(content).toContain('"kg"');
});

test("el historial filtra por tipo y pagina", async ({ page }) => {
  await signIn(page, ACCOUNTS.admin, "/admin/historial");
  await page.goto("/admin/historial");
  await expect(page.getByRole("navigation", { name: "Páginas del historial" })).toBeVisible();
  await page.getByRole("button", { name: /^Retiro · \d+/ }).click();
  for (const pill of await page.locator(".inventory-table tbody .status-pill").all()) await expect(pill).toHaveText("Retiro");
});

test("las direcciones antiguas redirigen a las nuevas páginas", async ({ page }) => {
  await signIn(page, ACCOUNTS.admin, "/");
  for (const [from, to] of [["/establecimiento", "/panel"], ["/establecimiento/inventario", "/panel/inventario"], ["/establecimiento/reservas", "/panel/reservas"], ["/establecimiento/reportes", "/panel/indicadores"], ["/proyecto", "/"], ["/admin/solicitudes", "/admin/usuarios"]]) {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to}$`));
  }
});

test("el directorio filtra por zona y lleva al perfil con sus ofertas", async ({ page }) => {
  await page.goto("/establecimientos");
  await expect(page.locator(".place-card")).toHaveCount(10);
  await page.getByRole("group", { name: "Filtrar por zona" }).getByRole("link", { name: "Muyurina", exact: true }).click();
  await expect(page).toHaveURL(/zona=Muyurina/);
  await expect(page.locator(".place-card")).toHaveCount(1);
  await page.getByRole("link", { name: /Minimarket Muyurina/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minimarket Muyurina");
  await expect(page.getByTestId("offer-card")).toHaveCount(3);
  await page.goto("/establecimientos/no-existe");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no ha brotado nada");
});

test("el registro de negocio en tres pasos crea la cuenta y abre el panel", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/negocios/unirse");
  await page.getByLabel("Nombre del establecimiento").fill(E2E_MARKER);
  await page.getByLabel("Dirección").fill("Av. Heroínas 100");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Días y horario de atención").fill("Lunes a viernes, 08:00–18:00");
  await page.getByLabel("Cuéntale a tus clientes qué ofreces").fill("Almuerzos caseros y panadería del día para retirar por la tarde.");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Tu nombre").fill("Persona de prueba");
  await page.getByLabel("Teléfono o WhatsApp").fill("70000000");
  await page.getByLabel("Correo para ingresar").fill(`e2e-${Date.now()}@correo.bo`);
  await page.locator("#biz-password").fill("Clave-segura-123");
  await page.getByRole("button", { name: "Crear cuenta del negocio" }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.locator(".sidebar-business")).toContainText(E2E_MARKER);
});

test("el formulario de contacto guarda el mensaje", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/contacto");
  await page.getByLabel("Nombre").fill("Persona de prueba");
  await page.getByLabel("Correo electrónico").fill("prueba@example.com");
  await page.getByLabel("Asunto").fill(E2E_MARKER);
  await page.getByLabel("Mensaje").fill("Este es un mensaje de prueba automática.");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByRole("heading", { name: "Mensaje enviado" })).toBeVisible();
  await signIn(page, ACCOUNTS.admin, "/admin/mensajes");
  await page.goto("/admin/mensajes");
  await expect(page.getByRole("heading", { name: E2E_MARKER }).first()).toBeVisible();
});

for (const width of [320, 360, 390, 768, 1024, 1440]) {
  test(`no hay desbordamiento horizontal a ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await page.setViewportSize({ width, height: 900 });
    const check = async (routes: string[]) => {
      for (const route of routes) {
        await test.step(route, async () => {
          await page.goto(route);
          await expect(page.locator("h1")).toBeVisible();
          await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        });
      }
    };
    await page.context().clearCookies();
    await check(["/", "/ofertas", "/ofertas/pan-artesanal", "/establecimientos", "/establecimientos/cafe-el-prado", "/como-funciona", "/negocios", "/negocios/unirse", "/nosotros", "/preguntas-frecuentes", "/contacto", "/ingresar", "/registro"]);
    await signIn(page, ACCOUNTS.customer, "/mis-reservas");
    await check(["/mis-reservas"]);
    await signIn(page, ACCOUNTS.admin, "/admin");
    await check(["/panel", "/panel/inventario", "/panel/reservas", "/panel/historial", "/panel/indicadores", "/admin", "/admin/historial", "/admin/usuarios", "/admin/mensajes"]);
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
  try { await page.goto("/ofertas"); await expect(page.getByRole("heading", { level: 1 })).toContainText("Las cosas buenas"); await expect(page.getByText("Para reservar necesitas conexión a internet.")).toBeVisible(); }
  finally { await context.setOffline(false); }
});
