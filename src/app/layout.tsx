import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GSP — Inversión Inmobiliaria Fraccionada",
  description:
    "Invierte en activos inmobiliarios desde $120.000. Liquidez inmediata con Salida Express. Costos operativos del 3% vs 15% del mercado. Micro Data Centers, Logística, Energía Solar y más.",
  keywords: [
    "GSP",
    "inversión inmobiliaria",
    "fraccionada",
    "dividendos",
    "Chile",
    "liquidez",
    "real estate",
    "data center",
    "energía solar",
  ],
  authors: [{ name: "GSP — Global Solidarity Partners" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GSP — Invierte en activos inmobiliarios desde $120.000",
    description:
      "Liquidez inmediata, costos del 3%, rendimientos superiores. Micro Data Centers, Logística, Energía Solar y más.",
    siteName: "GSP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSP — Inversión Inmobiliaria Fraccionada",
    description:
      "Invierte desde $120.000 con liquidez inmediata y costos operativos del 3%.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
