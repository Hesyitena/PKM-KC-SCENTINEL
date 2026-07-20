import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SCENTINEL — Food Spoilage Detection System",
  description:
    "Sistem monitoring IoT berbasis Edge AI untuk deteksi dini pembusukan makanan menggunakan sensor gas portabel.",
  keywords: ["SCENTINEL", "IoT", "food spoilage", "edge AI", "sensor gas", "PKM-KC"],
  authors: [{ name: "Tim SCENTINEL PKM-KC 2026" }],
  openGraph: {
    title: "SCENTINEL Dashboard",
    description: "Realtime food spoilage detection monitoring system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
            },
          }}
        />
      </body>
    </html>
  );
}
