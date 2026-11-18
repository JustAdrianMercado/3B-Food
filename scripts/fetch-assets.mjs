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
  "pollo-horno": "photo-1598103442097-8b74394b95c6",
  "pollo-plancha": "photo-1532550907401-a500c9a57435",
  "pollo-guiso": "photo-1604908176997-125f25cc6f3d",
  "crema-zapallo": "photo-1547592166-23ac45744acd",
  "sopa-verduras": "photo-1603105037880-880cd4edfb0d",
  ensalada: "photo-1540189549336-e6e99c3679fe",
  parrillada: "photo-1555939594-58d7cb561ad1",
  costillas: "photo-1544025162-d76694265947",
  medialunas: "photo-1530610476181-d83430b64dcd",
  panaderia: "photo-1517433670267-08bbd4be890f",
  "pan-integral": "photo-1549931319-a545dcf3bc73",
  "torta-frutilla": "photo-1565958011703-44f9829ba187",
  "torta-chocolate": "photo-1578985545062-69928b1d9587",
  galletas: "photo-1558961363-fa8fdf82db35",
  cereal: "photo-1521483451569-e33803c0330c",
  platanos: "photo-1571771894821-ce9b6c11b08e",
  frutas: "photo-1610832958506-aa56368176cf",
  verduras: "photo-1540420773420-3366772f4999",
  mercado: "photo-1566385101042-1a0aa0c1268c",
  leche: "photo-1550583724-b2692b85b150",
  queso: "photo-1486297678162-eb2a19b0a32d",
  lasana: "photo-1574894709920-11b28e7367e3",
  "pasta-penne": "photo-1621996346565-e3dbc646d9a9",
  arroz: "photo-1586201375761-83865001e31c",
  "pie-manzana": "photo-1601000938259-9e92002320b2",
  masitas: "photo-1528975604071-b4dc52a2d18c",
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
