import { ImageResponse } from "next/og";

export const alt = "EcoRescate Cochabamba: buena comida, una segunda oportunidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#f8f7f2", color: "#204c39", fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontFamily: "sans-serif", fontWeight: 700 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#204c39", color: "#f1efdf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>e</div>
        ecorescate.
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 1.05 }}>
        <span>Buena comida.</span>
        <span>Una segunda <span style={{ color: "#ac6245", fontStyle: "italic", marginLeft: 22 }}>oportunidad.</span></span>
      </div>
      <div style={{ display: "flex", fontSize: 30, fontFamily: "sans-serif", color: "#4d6735" }}>Excedentes de restaurantes y supermercados de Cochabamba, a un mejor precio.</div>
    </div>,
    size,
  );
}
