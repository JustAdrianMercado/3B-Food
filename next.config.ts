import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      { source: "/establecimiento", destination: "/panel", permanent: true },
      { source: "/establecimiento/inventario", destination: "/panel/inventario", permanent: true },
      { source: "/establecimiento/reservas", destination: "/panel/reservas", permanent: true },
      { source: "/establecimiento/reportes", destination: "/panel/indicadores", permanent: true },
      { source: "/proyecto", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
