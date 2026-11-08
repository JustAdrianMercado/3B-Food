import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const source = new URL("../public/icon.svg", import.meta.url);
const target = new URL("../public/icons/", import.meta.url);
await mkdir(target, { recursive: true });
for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  await sharp(source.pathname.replace(/^\/(?=[A-Za-z]:)/, "")).resize(size, size).png().toFile(new URL(name, target).pathname.replace(/^\/(?=[A-Za-z]:)/, ""));
}
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#204c39" } }).composite([{ input: await sharp(source.pathname.replace(/^\/(?=[A-Za-z]:)/, "")).resize(360, 360).png().toBuffer(), gravity: "centre" }]).png().toFile(new URL("icon-maskable-512.png", target).pathname.replace(/^\/(?=[A-Za-z]:)/, ""));
console.log("Iconos PWA generados: 192, 512, maskable y Apple 180.");
