import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeInitializer } from "@/components/ui/ThemeInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeInitializer />
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 300,
            },
          }}
        />
      </body>
    </html>
  );
}
