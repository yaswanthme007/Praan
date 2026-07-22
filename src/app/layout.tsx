import type { Metadata } from "next";
import { Chivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRAAN · Industrial Safety Intelligence",
  description:
    "PRAAN Mission Control — Compound risk intelligence across sensors, permits, workers and maintenance. See dangerous combinations before they happen.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${chivo.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-ink-hi antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
