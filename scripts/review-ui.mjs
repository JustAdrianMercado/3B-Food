import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(edge) ? edge : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
const responses = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => { if (response.status() >= 400) responses.push({ status: response.status(), url: response.url() }); });
await mkdir("tmp/qa", { recursive: true });
try {
  for (const [name, path, width, height] of [
    ["home-desktop", "/", 1440, 1050],
    ["home-mobile", "/", 390, 844],
    ["offers-tablet", "/ofertas", 768, 1024],
    ["business-desktop", "/establecimiento", 1440, 1050],
    ["business-mobile", "/establecimiento/inventario", 390, 844],
    ["admin-desktop", "/admin", 1440, 1050],
    ["detail-mobile", "/ofertas/pan-artesanal", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    if (name === "home-mobile" || name === "business-mobile") {
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
        for (let y = 0; y < document.documentElement.scrollHeight; y += 650) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 70)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
    }
    const result = await page.evaluate(() => ({ viewport: innerWidth, pageWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth, title: document.title, unloadedImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")) }));
    await page.screenshot({ path: join("tmp/qa", `${name}.png`), fullPage: name === "home-mobile" || name === "business-mobile" });
    console.log(name, JSON.stringify(result));
  }
  console.log("PAGE_ERRORS", JSON.stringify(errors));
  console.log("HTTP_ERRORS", JSON.stringify(responses));
  await writeFile("tmp/qa/review.json", JSON.stringify({ errors, responses }, null, 2));
} finally { await browser.close(); }
