"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/**
 * Kütüphane girişi: branş kartları + anlık arama.
 *
 * Önceki sürüm aramayı Express arka ucuna soruyordu. Arka uç canlıda hiç
 * çalışmadığı için uç, hata yerine UYDURMA sonuç döndürüyordu ve sayfa
 * bunları gerçekmiş gibi basıyordu: ziyaretçi 411 konuluk kütüphanenin
 * girişinde "ARANAN KELİME İLE İLGİLİ YEDEK SONUÇ 1" görüyordu.
 *
 * Artık veri sayfayla birlikte geliyor ve arama tarayıcıda çalışıyor:
 * ağ yok, arka uç yok, uydurma yok.
 */

export type KonuKaydi = { brans: string; slug: string; baslik: string };
export type BransKarti = {
  slug: string;
  baslik: string;
  aciklama: string;
  ikon: string;
  konuSayisi: number;
};

/** Türkçe arama için katlama: "İ/ı" ayrımı yüzünden düz toLowerCase yetmiyor. */
function katla(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export default function KutuphaneArama({
  konular,
  branslar,
}: {
  konular: KonuKaydi[];
  branslar: BransKarti[];
}) {
  const [sorgu, setSorgu] = useState("");

  const aranan = katla(sorgu.trim());
  const sonuclar = useMemo(() => {
    if (aranan.length < 2) return [];
    return konular
      .filter((k) => katla(k.baslik).includes(aranan))
      .sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"))
      .slice(0, 60);
  }, [aranan, konular]);

  const bransAdi = (slug: string) => branslar.find((b) => b.slug === slug)?.baslik || slug;

  return (
    <div>
      {/* ARAMA */}
      <div className="relative mb-8">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          aria-label="Kütüphanede konu ara"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          placeholder="Konu ara (örn: hiponatremi, anemi, tiroid)…"
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
        />
      </div>

      {/* SONUÇLAR */}
      {aranan.length >= 2 && (
        <div className="mb-12">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-[10px] font-black text-blue-900/50 uppercase tracking-[0.25em]">
              Sonuçlar
            </h2>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              {sonuclar.length === 0
                ? "eşleşme yok"
                : sonuclar.length === 60
                  ? "ilk 60"
                  : `${sonuclar.length} konu`}
            </span>
          </div>

          {sonuclar.length === 0 ? (
            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-sm font-bold text-slate-500">
                &quot;{sorgu}&quot; için konu bulunamadı.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Farklı bir terim dene ya da aşağıdan branşa göz at.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sonuclar.map((k) => (
                <Link
                  key={`${k.brans}/${k.slug}`}
                  href={`/topics/${k.brans}/${k.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-blue-900/30 hover:shadow-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-black uppercase italic leading-tight tracking-tight text-blue-950">
                      {k.baslik}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {bransAdi(k.brans)}
                    </div>
                  </div>
                  <span className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BRANŞLAR */}
      <div>
        <h2 className="text-[10px] font-black text-blue-900/50 uppercase tracking-[0.25em] mb-4">
          Branşlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branslar.map((b) => (
            <Link
              key={b.slug}
              href={`/topics/${b.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-900/30 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-2xl">{b.ikon}</span>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {b.konuSayisi} konu
                </span>
              </div>
              <div className="mt-3 text-sm font-black uppercase italic tracking-tight text-blue-950">
                {b.baslik}
              </div>
              {b.aciklama && (
                <div className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
                  {b.aciklama}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
