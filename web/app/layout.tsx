//"C:\Users\hucig\Medknowledge\web\app\layout.tsx"
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import { Providers } from './providers';
import { siteUrl, SITE_ADI, SITE_ACIKLAMA } from "@/lib/site";

/**
 * Sitenin metadata temeli. Önceden hiç yoktu: tek bir sayfada bile <title>,
 * açıklama, canonical veya paylaşım etiketi basılmıyordu. Google sonuçlarında
 * başlıksız görünüyor, bağlantı paylaşıldığında boş kutu çıkıyordu.
 *
 * metadataBase şart — göreli canonical ve og:image adreslerini mutlak hâle
 * getiren şey bu; olmadan Next uyarı verip adresleri eksik basıyor.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_ADI} — Dahiliye için Türkçe klinik kaynak`,
    // Alt sayfalar yalnızca kendi başlığını verir, kuyruk buradan eklenir.
    template: `%s · ${SITE_ADI}`,
  },
  description: SITE_ACIKLAMA,
  applicationName: SITE_ADI,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_ADI,
    locale: "tr_TR",
    title: `${SITE_ADI} — Dahiliye için Türkçe klinik kaynak`,
    description: SITE_ACIKLAMA,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_ADI} — Dahiliye için Türkçe klinik kaynak`,
    description: SITE_ACIKLAMA,
  },
  robots: { index: true, follow: true },
};

const inter = Inter({ subsets: ["latin-ext"], variable: "--font-sans" });
const merriweather = Merriweather({ subsets: ["latin-ext"], variable: "--font-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin-ext"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}