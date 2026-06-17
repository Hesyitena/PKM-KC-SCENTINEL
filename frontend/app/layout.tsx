import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
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
      <body className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
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
