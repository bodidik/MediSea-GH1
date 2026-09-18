"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * ELN 2022 AML genetik risk sınıflaması (Döhner ve ark., Blood 2022) — tanı anında.
 *
 * Öncelik sırası kuralın kendisi; karışık bulgularda sıra şöyle uygulanıyor:
 *   1. t(8;21) ya da inv(16)/t(16;16) → İYİ (eşlik eden KIT/FLT3 mutasyonu değiştirmez)
 *   2. bZIP in-frame CEBPA → İYİ
 *   3. NPM1 mutasyonu: kötü sitogenetik varsa KÖTÜ; FLT3-ITD varsa ORTA; yoksa İYİ
 *   4. t(9;11) → ORTA (nadir eşlik eden kötü mutasyonlara rağmen)
 *   5. Kötü sitogenetik, TP53 mutasyonu (VAF ≥ %10) ya da miyelodisplazi ilişkili gen mutasyonu → KÖTÜ
 *   6. FLT3-ITD (NPM1 yabanıl) → ORTA
 *   7. Başka sınıflanmamış → ORTA
 * Miyelodisplazi ilişkili mutasyonlar İYİ risk alt tiplerinde (1–3) risk grubunu değiştirmez.
 */
const IYI = [
  { id: "t821", metin: "t(8;21)(q22;q22.1) — RUNX1::RUNX1T1" },
  { id: "inv16", metin: "inv(16)(p13.1q22) ya da t(16;16) — CBFB::MYH11" },
  { id: "cebpa", metin: "bZIP in-frame CEBPA mutasyonu" },
] as const;
const MOLEKULER = [
  { id: "npm1", metin: "NPM1 mutasyonu" },
  { id: "flt3", metin: "FLT3-ITD (allel oranından bağımsız)" },
  { id: "tp53", metin: "TP53 mutasyonu (VAF ≥ %10)" },
] as const;
const ORTA_SITO = [{ id: "t911", metin: "t(9;11)(p21.3;q23.3) — MLLT3::KMT2A" }] as const;
const KOTU_SITO = [
  { id: "t69", metin: "t(6;9)(p23;q34.1) — DEK::NUP214" },
  { id: "kmt2a", metin: "t(v;11q23.3) — KMT2A yeniden düzenlenmesi (t(9;11) hariç)" },
  { id: "t922", metin: "t(9;22)(q34.1;q11.2) — BCR::ABL1" },
  { id: "t816", metin: "t(8;16)(p11;p13) — KAT6A::CREBBP" },
  { id: "inv3", metin: "inv(3)(q21.3q26.2) ya da t(3;3) — GATA2, MECOM(EVI1)" },
  { id: "t322", metin: "t(3q26.2;v) — MECOM(EVI1) yeniden düzenlenmesi" },
  { id: "del5", metin: "−5 ya da del(5q); −7; −17/abn(17p)" },
  { id: "kompleks", metin: "Kompleks karyotip (≥ 3 ilişkisiz anomali) ya da monozomal karyotip" },
] as const;
const MR_GEN = [{ id: "mrGen", metin: "Miyelodisplazi ilişkili gen mutasyonu: ASXL1, BCOR, EZH2, RUNX1, SF3B1, SRSF2, STAG2, U2AF1 ya da ZRSR2" }] as const;

type Grup = { ad: "İyi" | "Orta" | "Kötü"; neden: string };

function sinifla(s: ReadonlySet<string>): Grup {
  const kotuSito = KOTU_SITO.some((k) => s.has(k.id));
  if (s.has("t821") || s.has("inv16")) return { ad: "İyi", neden: "Kor bağlayıcı faktör lösemisi (t(8;21) ya da inv(16)) — eşlik eden mutasyonlar değiştirmez." };
  if (s.has("cebpa")) return { ad: "İyi", neden: "bZIP in-frame CEBPA mutasyonu." };
  if (s.has("npm1")) {
    if (kotuSito) return { ad: "Kötü", neden: "NPM1 mutasyonu var ama kötü riskli sitogenetik eşlik ediyor." };
    if (s.has("flt3")) return { ad: "Orta", neden: "NPM1 mutasyonu + FLT3-ITD (ELN 2022'de allel oranından bağımsız orta risk)." };
    return { ad: "İyi", neden: "NPM1 mutasyonu, FLT3-ITD yok." };
  }
  if (s.has("t911")) return { ad: "Orta", neden: "t(9;11) — eşlik eden nadir kötü mutasyonlara rağmen orta risk." };
  if (kotuSito) return { ad: "Kötü", neden: "Kötü riskli sitogenetik anomali." };
  if (s.has("tp53")) return { ad: "Kötü", neden: "TP53 mutasyonu (VAF ≥ %10)." };
  if (s.has("mrGen")) return { ad: "Kötü", neden: "Miyelodisplazi ilişkili gen mutasyonu." };
  if (s.has("flt3")) return { ad: "Orta", neden: "FLT3-ITD, NPM1 yabanıl, kötü riskli bulgu yok." };
  return { ad: "Orta", neden: "İyi ya da kötü olarak sınıflanmamış sitogenetik/moleküler bulgular." };
}

const RENK = { "İyi": "border-emerald-200 bg-emerald-50 text-emerald-900", "Orta": "border-amber-200 bg-amber-50 text-amber-900", "Kötü": "border-rose-200 bg-rose-50 text-rose-900" } as const;

export default function Eln2022AmlPage() {
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const [tamam, setTamam] = React.useState(false);
  const grup = tamam ? sinifla(secili) : null;

  const liste = (baslik: string, ms: ReadonlyArray<{ id: string; metin: string }>) => (
    <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <legend className="px-2 text-[12px] font-black text-blue-900">{baslik}</legend>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {ms.map((m) => (
          <label key={m.id} className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${secili.has(m.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}>
            <input type="checkbox" checked={secili.has(m.id)} onChange={() => setSecili((s) => kumeDegistir(s, m.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
            <span className="text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <OlcekKabugu
      slug="eln-2022-aml"
      ikon="🧬"
      baslik="ELN 2022 AML Genetik Riski"
      altBaslik="Akut Miyeloid Lösemi · Tanıdaki Sitogenetik ve Moleküler Bulgular"
      paylasim={{ grup: grup?.ad ?? null }}
      not={
        <p>
          Sınıflama yoğun kemoterapi alan hastalarda geliştirilmiştir; düşük yoğunluklu tedavi (ör. venetoklaks + hipometile edici ajan) alanlarda farklı
          risk modelleri önerilmiştir. Tedavi sırasında ölçülebilir kalıntı hastalık (MRD) riski yeniden tanımlar. FLT3-ITD allel oranı ELN 2022'de artık
          kullanılmaz. Döhner H ve ark., Blood 2022.
        </p>
      }
    >
      {liste("İyi riskli bulgular", IYI)}
      {liste("Moleküler bulgular", MOLEKULER)}
      {liste("Orta riskli sitogenetik", ORTA_SITO)}
      {liste("Kötü riskli sitogenetik", KOTU_SITO)}
      {liste("Miyelodisplazi ilişkili gen mutasyonları", MR_GEN)}

      <label className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={tamam} onChange={() => setTamam((v) => !v)} className="w-4 h-4 mt-0.5 accent-blue-900 shrink-0" />
        <span className="text-[12px] font-bold text-blue-950 leading-snug">
          <span className="font-black text-blue-900">Sitogenetik ve moleküler inceleme tamamlandı — </span>işaretlenmeyen bulgular yok kabul edilsin
        </span>
      </label>

      <SonucDuyuru metin={grup ? `ELN 2022: ${grup.ad} risk` : null} />
      {grup ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${RENK[grup.ad]}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">ELN 2022 genetik risk</p>
          <p className="text-4xl font-black">{grup.ad} risk</p>
          <p className="text-[12px] font-bold">{grup.neden}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Bulguları işaretleyip incelemenin tamamlandığını onaylayın</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
