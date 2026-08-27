//"C:\Users\hucig\Medknowledge\web\app\layout.tsx"
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import { Providers } from './providers';
import { siteUrl, SITE_ADI, SITE_ACIKLAMA } from "@/lib/site";
import { JsonLd, organizasyonSemasi, siteSemasi } from "@/lib/jsonld";

/**
 * Sitenin metadata temeli. Önceden hiç yoktu: tek bir sayfada bile <title>,
 * açıklama, canonical veya paylaşım etiketi basılmıyordu. Google sonuçlarında
 * başlıksız görünüyor, bağlantı paylaşıldığında boş kutu çıkıyordu.
 *
 * metadataBase şart — göreli canonical ve og:image adreslerini mutlak hâle
 * getiren şey bu; olmadan Next uyarı verip adresleri eksik basıyor.
 */
/**
 * Sitenin renk şeması AÇIK — ve bunu beyan etmek gerekiyor.
 *
 * Beyan yokken kök ögede `color-scheme: normal` kalıyor; bu durumda
 * tarayıcının KENDİ çizdiği yüzeyler (kaydırma çubuğu, `select` açılır
 * listesi, otomatik doldurma vurgusu, tarih seçici) işletim sistemi koyu
 * kipteyse koyu çiziliyor. Uygulamanın koyu teması YOK — ölçüldü, `app/`
 * altında `dark:` kullanan dosya sayısı sıfır ve `tailwind.config.js`
 * bilerek `darkMode: "class"` ile varyantları susturuyor.
 *
 * Yani beyan olmadan kullanıcı, baştan sona açık bir arayüzün içinde koyu
 * bir açılır liste görüyordu. Aynı tutarsızlığın içerik tarafındaki hâli
 * konu tablolarını okunmaz yapmıştı.
 */
export const viewport: Viewport = {
  colorScheme: "light",
  /* Mobil tarayıcı çubuğunun rengi. Beyan YOKKEN tarayıcı kendi
     varsayılanını kullanıyordu; marka rengi `app/icon.svg` ve
     `opengraph-image.tsx` ile AYNI lacivert — üç yüzey de tek değerden
     konuşsun diye. (Silinen ölü manifest burada #2563eb diyordu, yani
     bağlansaydı dördüncü bir gerçeklik daha üretecekti.) */
  themeColor: "#1a3a6b",
};

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
  },
  twitter: {
    // Yalnızca kart BİÇİMİ. Başlık ve açıklama BİLEREK yok: `twitter` alt
    // sayfalara olduğu gibi miras kalıyor ve hiçbir alt layout onu ezmiyor.
    // Burada sabit yazıldığında sitenin bütün sayfaları X'e ANA SAYFANIN
    // başlığını ve açıklamasını gönderiyordu (ölçüldü: 620 sayfa). Twitter
    // kart sözleşmesi twitter:title/description yoksa og:* değerlerine
    // düşüyor, yani sayfa başına doğru değer kendiliğinden geliyor.
    card: "summary_large_image",
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
        {/* Site geneli kimlik: alt sayfalardaki şemalar buradaki @id'lere bağlanıyor. */}
        <JsonLd veri={organizasyonSemasi()} />
        <JsonLd veri={siteSemasi()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}