"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Killip sınıflaması — akut MI'da kalp yetmezliği bulguları (Killip & Kimball, Am J Cardiol 1967).
 * Özgün mortalite oranları trombolitik/PKG öncesi döneme ait; ekranda bu açıkça yazıyor.
 */
const SINIFLAR = [
  { n: 1, ad: "Sınıf I", tanim: "Kalp yetmezliği bulgusu yok (raller yok, S3 yok)", ozgun: "~%6", renk: "emerald" },
  { n: 2, ad: "Sınıf II", tanim: "Hafif–orta kalp yetmezliği: akciğer alanlarının < %50'sinde raller, S3 galo ya da juguler venöz dolgunluk", ozgun: "~%17", renk: "amber" },
  { n: 3, ad: "Sınıf III", tanim: "Akut akciğer ödemi: akciğer alanlarının ≥ %50'sinde raller", ozgun: "~%38", renk: "orange" },
  { n: 4, ad: "Sınıf IV", tanim: "Kardiyojenik şok: hipotansiyon (SKB < 90 mmHg) ve periferik hipoperfüzyon bulguları", ozgun: "~%81", renk: "rose" },
] as const;

const BANTLAR: Bant[] = SINIFLAR.map((s) => ({
  aralik: s.ad,
  etiket: s.ad,
  alt: `Özgün seride hastane mortalitesi ${s.ozgun} (reperfüzyon öncesi dönem).`,
  renk: s.renk,
}));

export default function KillipPage() {
  const [secili, setSecili] = React.useState<number | null>(null);

  return (
    <OlcekKabugu
      slug="killip"
      ikon="🫀"
      baslik="Killip Sınıflaması"
      altBaslik="Akut Miyokard İnfarktüsünde Kalp Yetmezliği · I–IV"
      paylasim={{ killip: secili }}
      not={
        <p>
          Başvurudaki Killip sınıfı GRACE ve TIMI-STEMI skorlarının bileşenidir. Özgün mortalite oranları 1967 koroner bakım ünitesi serisine aittir;
          güncel reperfüzyon döneminde mutlak oranlar belirgin düşüktür ama sınıflar arası gradyan korunur. Killip T, Kimball JT, Am J Cardiol 1967.
        </p>
      }
    >
      <div role="group" aria-labelledby="killip-baslik" className="space-y-2">
        <p id="killip-baslik" className="text-[11px] font-black text-slate-600 uppercase tracking-widest px-1">Başvurudaki bulgulara uyan sınıfı seçin</p>
        {SINIFLAR.map((s) => {
          const aktif = secili === s.n;
          return (
            <button
              key={s.n}
              type="button"
              aria-pressed={aktif}
              onClick={() => setSecili(aktif ? null : s.n)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${aktif ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
            >
              <span className={`w-10 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${aktif ? "bg-amber-400 text-blue-900" : "bg-slate-100 text-blue-900"}`}>
                {["I", "II", "III", "IV"][s.n - 1]}
              </span>
              <span className={`text-[12px] leading-snug font-bold ${aktif ? "text-white" : "text-slate-700"}`}>{s.tanim}</span>
            </button>
          );
        })}
      </div>
      <SkorPaneli skor={secili} payda={4} skorBasligi="SINIF" bantlar={BANTLAR} aktif={secili === null ? null : BANTLAR[secili - 1]} eksikMetni="Bir sınıf seçin" />
    </OlcekKabugu>
  );
}
