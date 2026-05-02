import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "3GSP — Inversión Inmobiliaria Fraccionada",
  description: "Invierte en activos inmobiliarios premium con fracciones accesibles. 3GSP.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
