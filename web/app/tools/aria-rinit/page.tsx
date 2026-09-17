"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/**
 * ARIA allerjik rinit sınıflaması (Bousquet ve ark., JACI 2001; ARIA 2008 güncellemesi).
 * Puan yok — iki eksen: süre (intermitan / persistan) × şiddet (hafif / orta-ağır).
 *
 * Süre ekseninde iki soru birlikte sorulur: persistan için İKİSİ de gerekir
 * (haftada ≥ 4 gün VE art arda ≥ 4 hafta); biri bile karşılanmıyorsa intermitan.
 */
const SIDDET_MADDELERI = [
  { id: "uyku", metin: "Uyku bozukluğu" },
  { id: "gunluk", metin: "Günlük etkinliklerde, boş zaman etkinliklerinde ve/veya sporda kısıtlanma" },
  { id: "okul", metin: "Okul ya da iş performansında bozulma" },
  { id: "rahatsiz", metin: "Rahatsız edici belirtiler" },
] as const;

type EvetHayir = "evet" | "hayir" | null;

function EvetHayirSoru({ id, soru, aciklama, deger, onSec }: { id: string; soru: string; aciklama: string; deger: EvetHayir; onSec: (v: EvetHayir) => void }) {
  const baslikId = `aria-${id}`;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p id={baslikId} className="text-[12px] font-black text-blue-900 leading-snug">{soru}</p>
      <p className="text-[11px] text-slate-600 leading-snug mt-1">{aciklama}</p>
      <div role="group" aria-labelledby={baslikId} className="flex gap-2 mt-3">
        {(["evet", "hayir"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={deger === v}
            onClick={() => onSec(deger === v ? null : v)}
            className={`flex-1 min-h-[44px] rounded-xl border-2 text-[12px] font-black transition-all
              ${deger === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
          >
            {v === "evet" ? "Evet" : "Hayır"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AriaRinitPage() {
  const [gun, setGun] = React.useState<EvetHayir>(null);
  const [hafta, setHafta] = React.useState<EvetHayir>(null);
  const [siddet, setSiddet] = React.useState<Record<string, boolean>>(Object.fromEntries(SIDDET_MADDELERI.map((m) => [m.id, false])));

  const sure = gun === null || hafta === null ? null : gun === "evet" && hafta === "evet" ? "Persistan" : "İntermitan";
  const siddetVar = SIDDET_MADDELERI.filter((m) => siddet[m.id]);
  const siddetEtiket = siddetVar.length > 0 ? "orta–ağır" : "hafif";
  const sonuc = sure ? `${sure}, ${siddetEtiket} allerjik rinit` : null;

  return (
    <OlcekKabugu
      slug="aria-rinit"
      ikon="🤧"
      baslik="ARIA Rinit Sınıflaması"
      altBaslik="Allergic Rhinitis and its Impact on Asthma · Süre × Şiddet"
      paylasim={{ gun, hafta, siddet: siddetVar.length }}
      not={
        <p>
          ARIA sınıflaması tedavi basamağını seçmek içindir: hafif intermitanda oral/intranazal antihistaminik, orta–ağır persistanda intranazal
          kortikosteroid öne çıkar. Sınıflama belirtiler tedavisizken değerlendirilir. Mevsimsel/perenyal ayrımının yerini alır.
          Bousquet J ve ark., J Allergy Clin Immunol 2001; ARIA 2008.
        </p>
      }
    >
      <section className="space-y-3" aria-labelledby="aria-sure">
        <h2 id="aria-sure" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">1. Süre</h2>
        <EvetHayirSoru id="gun" soru="Belirtiler haftada 4 gün ya da daha fazla oluyor mu?" aciklama="Haftada < 4 gün ise intermitan." deger={gun} onSec={setGun} />
        <EvetHayirSoru id="hafta" soru="Belirtiler art arda 4 hafta ya da daha uzun sürüyor mu?" aciklama="< 4 hafta ise intermitan. Persistan için iki sorunun da yanıtı evet olmalı." deger={hafta} onSec={setHafta} />
      </section>

      <section className="space-y-3" aria-labelledby="aria-siddet">
        <h2 id="aria-siddet" className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">2. Şiddet</h2>
        <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <legend className="px-2 text-[12px] font-black text-blue-900">Aşağıdakilerden var olanları işaretleyin</legend>
          <p className="text-[11px] text-slate-600 mt-1">Hiçbiri yoksa hafif; bir ya da daha fazlası varsa orta–ağır.</p>
          <div className="grid grid-cols-1 gap-2 mt-3">
            {SIDDET_MADDELERI.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                  ${siddet[m.id] ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
              >
                <input
                  type="checkbox"
                  checked={siddet[m.id]}
                  onChange={() => setSiddet((s) => ({ ...s, [m.id]: !s[m.id] }))}
                  className="w-4 h-4 accent-blue-900 shrink-0"
                />
                <span className="text-[12px] font-bold text-blue-950">{m.metin}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <SonucDuyuru metin={sonuc} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${siddetVar.length > 0 ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ARIA sınıfı</p>
          <p className={`text-xl font-black ${siddetVar.length > 0 ? "text-rose-800" : "text-emerald-800"}`}>{sonuc}</p>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            {["İntermitan", "Persistan"].flatMap((s) =>
              ["hafif", "orta–ağır"].map((d) => {
                const aktif = s === sure && d === siddetEtiket;
                return (
                  <div key={`${s}-${d}`} className={`rounded-xl p-2 font-black ${aktif ? "bg-blue-900 text-white" : "bg-white/70 text-slate-600"}`}>
                    {s} · {d}
                  </div>
                );
              })
            )}
          </div>
          {siddetVar.length > 0 && (
            <p className="text-[11px] font-bold text-slate-700">Şiddeti belirleyen: {siddetVar.map((m) => m.metin.toLocaleLowerCase("tr-TR")).join(" · ")}</p>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Süre sorularının ikisini de yanıtlayın</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
