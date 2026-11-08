import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const images = {
  hero: "photo-1546069901-ba9599a7e63c",
  bread: "photo-1509440159596-0249088772ff",
  bowl: "photo-1512621776951-a57141f2eefd",
  produce: "photo-1542838132-92c53300491e",
  pastry: "photo-1555507036-ab1f4038808a",
  yogurt: "photo-1488477181946-6428a0291777",
  pasta: "photo-1551183053-bf91a1d81141",
  pantry: "photo-1547592180-85f173990554",
};
const target = new URL("../public/images/", import.meta.url);
await mkdir(target, { recursive: true });
for (const [name, id] of Object.entries(images)) {
  const destination = new URL(`${name}.webp`, target);
  try { if ((await stat(destination)).size > 0) { console.log(`${name}.webp ya está disponible`); continue; } } catch { /* Download only missing assets. */ }
  const url = `https://images.unsplash.com/${id}?fit=crop&w=${name === "hero" ? 1400 : 900}&q=85&fm=webp`;
  if (process.platform === "win32") {
    await run("curl.exe", ["--ipv4", "--fail", "--location", "--silent", "--show-error", "--retry", "2", "--retry-all-errors", "--retry-delay", "1", "--connect-timeout", "15", "--max-time", "50", url, "--output", fileURLToPath(destination)]);
    console.log(`${name}.webp descargada`);
  } else {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`No se pudo descargar ${name}: ${response.status}`);
    const content = new Uint8Array(await response.arrayBuffer());
    await writeFile(new URL(`${name}.webp`, target), content);
    console.log(`${name}.webp: ${Math.round(content.byteLength / 1024)} KB`);
  }
}
console.log(`Fotografías ilustrativas guardadas en ${fileURLToPath(target)}`);
