import type { MetadataRoute } from "next";

// La app instalable es el panel del analista.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Briebluunt · Panel de briefings",
    short_name: "Briebluunt",
    description: "Panel de análisis de briefings de clientes",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#2c0046",
    theme_color: "#2c0046",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
