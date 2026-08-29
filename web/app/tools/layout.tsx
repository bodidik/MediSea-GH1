import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getToolCount } from "@/app/lib/topic-counts";

/**
 * Klinik araçlar dizininin metadata'sı.
 *
 * app/tools/page.tsx bir istemci bileşeni ("use client") ve istemci
 * bileşenleri metadata dışa aktaramaz — bu yüzden araç dizini kök başlığını
 * devralıyor, kendi başlığı olmuyordu. "klinik hesaplayıcı" aramaları tam da
 * bu sayfanın karşılaması gereken trafik.
 *
 * Sayı elle yazılmıyor ama app/tools klasöründen de sayılmıyor: sunucusuz
 * ortamda kaynak app/ dizini çalışma zamanında yok. Ortak sayaç
 * content/arac-index.json'u okuyor (bkz. getToolCount).
 */
export async function generateMetadata(): Promise<Metadata> {
  const n = getToolCount();
  const aciklama = n
    ? `${n} klinik hesaplayıcı ve skor: eGFR, Wells, CHA₂DS₂-VASc, Child-Pugh ve daha fazlası. Ücretsiz, kayıt gerekmez.`
    : "Klinik hesaplayıcılar ve skorlar. Ücretsiz, kayıt gerekmez.";

  return {
    // default'a kuyruk eklenmez (kök şablonu zaten uyguluyor); template ise
    // araç sayfalarının kendi başlıklarının kuyruğunu koruyor.
    title: { default: "Klinik Hesaplayıcılar", template: "%s · MediSea" },
    description: aciklama,
    alternates: { canonical: "/tools" },
    openGraph: {
      type: "website",
      title: "Klinik Hesaplayıcılar — MediSea",
      description: aciklama,
      url: "/tools",
    },
  };
}

/**
 * `main` landmark'ı buradan geliyor.
 *
 * Araç sayfaları (site) route grubunun dışında ve AppShell almıyorlar; ölçümde
 * 115 sayfanın hepsinde `main` sayısı SIFIRDI. Landmark olmayan bir sayfada
 * ekran okuyucu "içeriğe git" diyemiyor, kullanıcı baştan sona gezinmek
 * zorunda kalıyor.
 *
 * Gezinme çubuğu (ToolTopNav) sayfaların içinde render edildiği için bu
 * main'in İÇİNDE kalıyor. İdeal yerleşim değil ama landmark'ın hiç
 * olmamasından iyi; atlama bağlantısı da zaten gezinmeyi aşacak şekilde
 * ToolTopNav'ın kendi içinde çözüldü.
 */
export default function AraclarDuzen({ children }: { children: ReactNode }) {
  return (
    <main>
      {/*
        JS ÇALIŞMIYORSA SESSİZ KALMA.

        Araçlar istemci bileşeni: hesap tarayıcıda yapılıyor. Ama sunucu
        HTML'i etiketli girdileri ve — varsayılanı olan araçlarda — BİR SONUÇ
        PANELİNİ de taşıyor. Ölçüldü: 130 aracın 84'ü sunucuda `<input>`
        basıyor (451 girdi) ve **25'i sunucuda bir KLİNİK HÜKÜM** basıyor
        ("Sınıf II", "Düşük Risk — Ayaktan Takip", "AKI Kriteri Yok"…).

        Yani JS düşmüşse sayfa çalışan bir hesaplayıcı GİBİ görünüyor:
        kullanıcı kendi değerini yazıyor, hüküm DEĞİŞMİYOR ve varsayılandan
        gelen yanlış sayı onun girdisinin yanında duruyor. Deponun kendi
        kuralı — uydurulmuş bir başarı, üstüne karar verilen yanlış bir
        varsayım üretir.

        Bu şerit YALNIZCA JS kapalı/düşmüşken çiziliyor; JS açıkken tarayıcı
        <noscript> içeriğini ögeye bile çevirmiyor.
      */}
      <noscript>
        <div className="mx-auto max-w-3xl px-4 pt-6">
          {/* Kenarlık amber-600: kutuyu sayfadan ayıran tek görsel sınır ve
              amber-500 hem sayfaya (2.05) hem kutuya (2.07) karşı 3'ün
              altındaydı — WCAG 1.4.11 metin dışı kontrast eşiği. */}
          <div className="rounded-2xl border-2 border-amber-600 bg-amber-50 p-5 text-blue-950">
            <p className="text-sm font-black uppercase tracking-widest text-amber-800">
              Hesaplama şu an çalışmıyor
            </p>
            <p className="mt-2 text-sm font-bold leading-relaxed">
              Bu sayfadaki hesaplamalar ve süzgeçler tarayıcıda çalışıyor;
              JavaScript kapalı ya da yüklenemediği için girdiğin değerler
              sonuca yansımaz. Ekranda bir sonuç görüyorsan o BAŞLANGIÇ
              değerlerine aittir — kendi değerlerine değil.
            </p>
            <p className="mt-3 text-sm font-bold">
              {/* <Link> JS'siz ortamda da düz bir <a> olarak basılıyor;
                  yani şeridin çıkış yolu her iki durumda da çalışıyor. */}
              <Link href="/topics" className="text-blue-900 underline">
                Kütüphaneye git
              </Link>{" "}
              — konu anlatımları JavaScript olmadan da okunur.
            </p>
          </div>
        </div>
      </noscript>
      {children}
    </main>
  );
}
