import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

/* Fonts live in ./fonts rather than coming from next/font/google: the build
   container has no route to fonts.googleapis.com, and the VIEWER kiosk runs on
   the ESP32's LAN with no internet either. Variable woff2, one file per family
   covering the whole weight range. */
const plusJakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-jakarta",
  display: "swap",
  weight: "300 700",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  variable: "--font-grotesk",
  display: "swap",
  weight: "300 700",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "400 600",
  adjustFontFallback: false,
});

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
      <body
        className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
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
