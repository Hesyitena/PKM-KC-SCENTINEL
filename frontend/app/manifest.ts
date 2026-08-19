import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SCENTINEL — Food Spoilage Detection System",
    short_name: "SCENTINEL",
    description:
      "Sistem monitoring IoT berbasis Edge AI untuk deteksi dini pembusukan makanan menggunakan sensor gas portabel.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#533afd",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
