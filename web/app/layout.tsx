// FILE: web/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/components/AppShell";

// Google Fonts (TR/EN uyumlu)
const inter = Inter({
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-sans",
});

const merriweather = Merriweather({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-serif",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

// Metadata
export const metadata: Metadata = {
  title: {
    default: "Medknowledge",
    template: "%s   Medknowledge",
  },
  description: "   hastal klar  e itim ve s nav platformu",
  applicationName: "Medknowledge",
  authors: [{ name: "Medknowledge" }],
  keywords: [
    "i  hastal klar ",
    "nefroloji",
    "hematoloji",
    "endokrinoloji",
    "romatoloji",
    "kardiyoloji",
    "gastroenteroloji",
    "enfeksiyon",
    "YDUS",
    "USMLE",
  ],
  openGraph: {
    title: "Medknowledge",
    description: "   hastal klar  e itim ve s nav platformu",
    type: "website",
    locale: "tr_TR",
    siteName: "Medknowledge",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Viewport
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

// Tek RootLayout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${inter.variable} ${merriweather.variable} ${jetbrains.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}





