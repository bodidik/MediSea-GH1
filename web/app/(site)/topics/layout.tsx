import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Kütüphane sayfasının metadata'sı.
 *
 * app/(site)/topics/page.tsx bir istemci bileşeni ("use client") ve istemci
 * bileşenleri metadata dışa aktaramaz — bu yüzden kütüphane girişi kök
 * başlığını devralıyor, kendi başlığı ve açıklaması olmuyordu. Next'te bunun
 * standart çözümü, aynı segmente metadata taşıyan bir sunucu layout'u koymak
 * (araç sayfalarında da aynı kalıp kullanıldı).
 *
 * Sayılar elle yazılmıyor: gizli konular hariç tutularak diskten sayılıyor.
 * Sabit yazılan bir sayı içerik büyüdükçe sessizce yalan hâline gelir.
 *
 * Alt segmentler (branş ve konu sayfaları) kendi generateMetadata'larıyla
 * buradaki değerleri eziyor; yalnızca kütüphane girişi etkileniyor.
 */

function sayimYap(): { brans: number; konu: number } {
  try {
    const kok = path.join(process.cwd(), "content", "canonical");
    const branslar = fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let konu = 0;
    for (const b of branslar) {
      for (const f of fs.readdirSync(path.join(kok, b)).filter((f) => f.endsWith(".json"))) {
        try {
          const v = JSON.parse(fs.readFileSync(path.join(kok, b, f), "utf-8"));
          if (v?.meta?.hidden !== true) konu++;
        } catch {
          // Bozuk dosya sayıma girmesin.
        }
      }
    }
    return { brans: branslar.length, konu };
  } catch {
    return { brans: 0, konu: 0 };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { brans, konu } = sayimYap();
  const govde =
    brans > 0 && konu > 0
      ? `${brans} branşta ${konu} konu başlığı: `
      : "";
  const aciklama = `${govde}dahiliye asistanları ve uzmanları için güncel Türkçe konu anlatımları. Ücretsiz, kayıt gerekmez.`;

  return {
    // DÜZ METİN BAŞLIK VERİLMEZ. Bir düzen `title: "Kütüphane"` yazarsa kökteki
    // title.template alt segmentler için sıfırlanır ve branş sayfası
    // "Kardiyoloji · MediSea" yerine yalnızca "Kardiyoloji" olur. Şablon
    // burada yeniden bildirilerek çocuklara taşınıyor.
    // default'a kuyruk EKLENMEZ: kökteki şablon zaten uyguluyor, yazarsak
    // "Kütüphane · MediSea · MediSea" çıkıyor. template ise yalnızca
    // çocuklar için — o olmazsa branş sayfası kuyruğunu kaybediyor.
    title: { default: "Kütüphane", template: "%s · MediSea" },
    description: aciklama,
    alternates: { canonical: "/topics" },
    openGraph: {
      type: "website",
      title: "Kütüphane — MediSea",
      description: aciklama,
      url: "/topics",
    },
  };
}

export default function KutuphaneDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
