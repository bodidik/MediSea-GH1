"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Spesifik IgE sınıflaması — ImmunoCAP (FEIA) 0–6 sınıf ölçeği, kU_A/L.
 *
 * Sınıf DUYARLANMAYI gösterir, klinik allerjiyi DEĞİL: yüksek sınıflı ama belirtisiz
 * duyarlanma sık, düşük sınıflı gerçek allerji de olur. Ekran bunu her satırda
 * değil bir kez, sonuç başlığının altında söylüyor.
 */
const SINIFLAR = [
  { sinif: 0, alt: 0, ust: 0.35, aralik: "< 0,35", yorum: "Saptanmadı" },
  { sinif: 1, alt: 0.35, ust: 0.7, aralik: "0,35–0,69", yorum: "Çok düşük" },
  { sinif: 2, alt: 0.7, ust: 3.5, aralik: "0,70–3,49", yorum: "Düşük" },
  { sinif: 3, alt: 3.5, ust: 17.5, aralik: "3,5–17,49", yorum: "Orta" },
  { sinif: 4, alt: 17.5, ust: 50, aralik: "17,5–49,9", yorum: "Yüksek" },
  { sinif: 5, alt: 50, ust: 100, aralik: "50–99,9", yorum: "Çok yüksek" },
  { sinif: 6, alt: 100, ust: Infinity, aralik: "≥ 100", yorum: "Çok yüksek" },
] as const;

const DEGER_UST = 10000;
const SATIR_UST = 12;

type Satir = { anahtar: number; ad: string; deger: string };

function sinifBul(v: number) {
  return SINIFLAR.find((s) => v >= s.alt && v < s.ust)!;
}

const RENK = ["bg-slate-100 text-slate-700", "bg-amber-100 text-amber-900", "bg-amber-200 text-amber-900", "bg-orange-200 text-orange-900", "bg-rose-200 text-rose-900", "bg-rose-700 text-white", "bg-rose-900 text-white"];

export default function SpesifikIgePage() {
  const sayac = React.useRef(3);
  const [satirlar, setSatirlar] = React.useState<Satir[]>([
    { anahtar: 1, ad: "", deger: "" },
    { anahtar: 2, ad: "", deger: "" },
  ]);

  const guncelle = (anahtar: number, alan: "ad" | "deger", v: string) =>
    setSatirlar((s) => s.map((x) => (x.anahtar === anahtar ? { ...x, [alan]: v } : x)));

  const cozum = satirlar.map((s) => {
    const n = parseLocaleNumber(s.deger);
    const girildi = s.deger.trim() !== "";
    const gecerli = sayiGirildiMi(s.deger) && n >= 0 && n <= DEGER_UST;
    return { ...s, n, girildi, gecerli, sinif: gecerli ? sinifBul(n) : null };
  });
  const gecerliler = cozum.filter((c) => c.gecerli);
  const pozitif = gecerliler.filter((c) => c.sinif!.sinif >= 1);
  const ozet =
    gecerliler.length === 0
      ? null
      : `Pozitif (≥ 0,35 kU/L): ${pozitif.length} / ${gecerliler.length} allerjen${pozitif.length ? ` · en yüksek sınıf ${Math.max(...pozitif.map((p) => p.sinif!.sinif))}` : ""}`;

  return (
    <OlcekKabugu
      slug="spesifik-ige"
      ikon="🧫"
      baslik="Spesifik IgE Sınıfı"
      altBaslik="ImmunoCAP (FEIA) · kU/L → Sınıf 0–6"
      paylasim={{ allerjen: gecerliler.length, pozitif: pozitif.length }}
      not={
        <>
          <p>
            <strong>Pozitif spesifik IgE duyarlanmadır, allerji tanısı değildir</strong> — sonuç ancak öyküyle uyumluysa anlamlıdır. Besin allerjisinde
            %95 pozitif öngörü değerleri allerjene, yaşa ve toplumdan topluma değişir; bu araç onları uygulamaz.
          </p>
          <p>
            0,35 kU/L klasik eşiktir; güncel analizörler 0,1 kU/L'ye kadar ölçer ve bazı laboratuvarlar ≥ 0,1'i pozitif bildirir. Sınıf aralıkları
            yönteme özgüdür — farklı platformların (ör. Immulite) sonuçları birbirinin yerine kullanılamaz.
          </p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-3">
        {cozum.map((c, i) => (
          <div key={c.anahtar} className="grid grid-cols-[minmax(0,1fr)_7rem] sm:grid-cols-[minmax(0,1fr)_9rem_7rem_auto] gap-2 items-end border-b border-slate-100 pb-3 last:border-0">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Allerjen {i + 1}</span>
              <input
                type="text"
                value={c.ad}
                onChange={(e) => guncelle(c.anahtar, "ad", e.target.value)}
                placeholder="ör. d1 ev tozu akarı"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-900 outline-none font-bold min-w-0"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">kU/L</span>
              <input
                type="text"
                inputMode="decimal"
                value={c.deger}
                onChange={(e) => guncelle(c.anahtar, "deger", e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-900 outline-none font-bold min-w-0"
              />
            </label>
            <div className="min-h-[44px] flex items-center col-span-1" aria-live="off">
              {c.sinif ? (
                <span className={`rounded-lg px-2 py-1.5 text-[11px] font-black ${RENK[c.sinif.sinif]}`}>
                  Sınıf {c.sinif.sinif} · {c.sinif.yorum}
                </span>
              ) : c.girildi ? (
                <span className="text-[11px] font-bold text-rose-800">0–{DEGER_UST} arası sayı</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSatirlar((s) => s.filter((x) => x.anahtar !== c.anahtar))}
              disabled={satirlar.length === 1}
              aria-label={`Allerjen ${i + 1} satırını sil`}
              className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 text-[11px] font-black text-slate-700 hover:border-rose-300 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSatirlar((s) => [...s, { anahtar: sayac.current++, ad: "", deger: "" }])}
          disabled={satirlar.length >= SATIR_UST}
          className="w-full min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[12px] font-black text-blue-900 hover:border-blue-300 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          + Allerjen ekle {satirlar.length >= SATIR_UST ? `(en fazla ${SATIR_UST})` : ""}
        </button>
      </div>

      <SonucDuyuru metin={ozet} />
      {ozet ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white space-y-3">
          <p className="text-[13px] font-black text-blue-900">{ozet}</p>
          <table className="w-full text-[11px]">
            <caption className="sr-only">ImmunoCAP sınıf aralıkları</caption>
            <thead>
              <tr className="text-left text-slate-600">
                <th scope="col" className="py-1 pr-2">Sınıf</th>
                <th scope="col" className="py-1 pr-2">kU/L</th>
                <th scope="col" className="py-1">Düzey</th>
              </tr>
            </thead>
            <tbody>
              {SINIFLAR.map((s) => {
                const var_ = gecerliler.some((g) => g.sinif!.sinif === s.sinif);
                return (
                  <tr key={s.sinif} className={var_ ? "font-black text-blue-900" : "text-slate-700"}>
                    <th scope="row" className="py-1 pr-2 text-left font-[inherit]">{s.sinif}</th>
                    <td className="py-1 pr-2">{s.aralik}</td>
                    <td className="py-1">{s.yorum}{var_ ? " (bu sonuçta var)" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">En az bir allerjen değeri girin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
