import type { MetadataRoute } from "next";

// Generates /manifest.webmanifest (Next auto-links it in <head>).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Licensed to Glow",
    short_name: "Glow",
    description:
      "One membership for the salons, spas and clinics worth returning to. Discover, book and track your glow.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfaf7",
    theme_color: "#2b2118",
    categories: ["lifestyle", "health", "beauty"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
