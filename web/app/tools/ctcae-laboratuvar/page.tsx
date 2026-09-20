"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * CTCAE v5.0 laboratuvar advers olay derecelendirmesi — doz değişikliği kararlarının ortak dili.
 *
 * Sitopenilerde eşik MUTLAK, ama derece 1 "alt sınır (LLN) ile şu değer arası" diye tanımlı:
 *   Anemi          <LLN–10,0 · <10,0–8,0 · <8,0 (transfüzyon) · yaşamı tehdit eden
 *   Nötrofil       <LLN–1500 · <1500–1000 · <1000–500 · <500
 *   Trombosit      <LLN–75.000 · <75.000–50.000 · <50.000–25.000 · <25.000
 * Karaciğer/böbrekte eşik ÜST SINIRIN KATI:
 *   ALT · AST      >ULN–3× · >3–5× · >5–20× · >20×
 *   Bilirubin      >ULN–1,5× · >1,5–3× · >3–10× · >10×
 *   Kreatinin      >ULN–1,5× · >1,5–3× · >3–6× · >6×
 *
 * Yerel sınır girilmediyse derece 1 ile derece 0 AYRILAMAZ; araç "derece 0–1, sınır girilmedi" der,
 * sessizce 0 saymaz. Anemide derece 4 klinik (yaşamı tehdit eden) bir tanım — araç "≥ 3" basar.
 */
type Tanim = {
  id: string;
  ad: string;
  birim: string;
  tip: "dusen" | "oran";
  /** dusen: [d2, d3, d4] eşikleri (değer bunun ALTINDA ise o derece) · oran: [d1üst, d2üst, d3üst] kat */
  esik: readonly [number, number, number];
  sinirAdi: string;
  ustDerece?: 3;
  ust: number;
};

const TANIMLAR: ReadonlyArray<Tanim> = [
  { id: "hb", ad: "Hemoglobin", birim: "g/dL", tip: "dusen", esik: [10, 8, 0], sinirAdi: "Alt sınır (LLN)", ustDerece: 3, ust: 25 },
  { id: "anc", ad: "Mutlak nötrofil", birim: "/µL", tip: "dusen", esik: [1500, 1000, 500], sinirAdi: "Alt sınır (LLN)", ust: 100000 },
  { id: "plt", ad: "Trombosit", birim: "/µL", tip: "dusen", esik: [75000, 50000, 25000], sinirAdi: "Alt sınır (LLN)", ust: 2000000 },
  { id: "alt", ad: "ALT", birim: "U/L", tip: "oran", esik: [3, 5, 20], sinirAdi: "Üst sınır (ULN)", ust: 20000 },
  { id: "ast", ad: "AST", birim: "U/L", tip: "oran", esik: [3, 5, 20], sinirAdi: "Üst sınır (ULN)", ust: 20000 },
  { id: "bil", ad: "Total bilirubin", birim: "mg/dL", tip: "oran", esik: [1.5, 3, 10], sinirAdi: "Üst sınır (ULN)", ust: 80 },
  { id: "kr", ad: "Kreatinin", birim: "mg/dL", tip: "oran", esik: [1.5, 3, 6], sinirAdi: "Üst sınır (ULN)", ust: 30 },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-base min-w-0 w-full";
const sayi = (x: number) => x.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

type Sonuc = { t: Tanim; deger: number; derece: number | null; metin: string; belirsiz: boolean };

function derecele(t: Tanim, deger: number, sinir: number | null): Sonuc {
  if (t.tip === "dusen") {
    const [d2, d3, d4] = t.esik;
    if (t.ustDerece === 3) {
      if (deger < d3) return { t, deger, derece: 3, metin: `Derece ≥ 3 — < ${sayi(d3)} ${t.birim}; derece 4 klinik olarak (yaşamı tehdit eden) tanımlanır`, belirsiz: false };
    } else if (deger < d4) {
      return { t, deger, derece: 4, metin: `Derece 4 — < ${sayi(d4)} ${t.birim}`, belirsiz: false };
    }
    if (t.ustDerece !== 3 && deger < d3) return { t, deger, derece: 3, metin: `Derece 3 — < ${sayi(d3)} ${t.birim}`, belirsiz: false };
    if (deger < d2) return { t, deger, derece: 2, metin: `Derece 2 — < ${sayi(d2)} ${t.birim}`, belirsiz: false };
    if (sinir === null) return { t, deger, derece: null, metin: `Derece 0–1 — derece 1 "< yerel alt sınır" ile başlıyor, sınır girilmedi`, belirsiz: true };
    return deger < sinir
      ? { t, deger, derece: 1, metin: `Derece 1 — alt sınırın (${sayi(sinir)}) altında, ${sayi(d2)} ${t.birim} üstünde`, belirsiz: false }
      : { t, deger, derece: 0, metin: "Derece 0 — alt sınırın üstünde", belirsiz: false };
  }
  if (sinir === null) return { t, deger, derece: null, metin: "Üst sınır (ULN) girilmedi — kat hesaplanamıyor", belirsiz: true };
  const kat = deger / sinir;
  const [k1, k2, k3] = t.esik;
  const ek = ` (${kat.toFixed(2).replace(".", ",")} × ULN)`;
  if (kat > k3) return { t, deger, derece: 4, metin: `Derece 4 — > ${sayi(k3)} × üst sınır${ek}`, belirsiz: false };
  if (kat > k2) return { t, deger, derece: 3, metin: `Derece 3 — > ${sayi(k2)}–${sayi(k3)} × üst sınır${ek}`, belirsiz: false };
  if (kat > k1) return { t, deger, derece: 2, metin: `Derece 2 — > ${sayi(k1)}–${sayi(k2)} × üst sınır${ek}`, belirsiz: false };
  if (kat > 1) return { t, deger, derece: 1, metin: `Derece 1 — üst sınır ile ${sayi(k1)} × arası${ek}`, belirsiz: false };
  return { t, deger, derece: 0, metin: `Derece 0 — üst sınırın altında${ek}`, belirsiz: false };
}

const RENK = ["border-emerald-200 bg-emerald-50 text-emerald-900", "border-emerald-200 bg-emerald-50 text-emerald-900", "border-amber-200 bg-amber-50 text-amber-900", "border-orange-200 bg-orange-50 text-orange-900", "border-rose-200 bg-rose-50 text-rose-900"] as const;

export default function CtcaeLaboratuvarPage() {
  const [deger, setDeger] = React.useState<Record<string, string>>({});
  const [sinir, setSinir] = React.useState<Record<string, string>>({});

  const n = parseLocaleNumber;
  const gecerli = (s: string | undefined, t: Tanim) => !!s && sayiGirildiMi(s) && n(s) >= 0 && n(s) <= t.ust;

  const sonuclar = TANIMLAR.filter((t) => gecerli(deger[t.id], t)).map((t) =>
    derecele(t, n(deger[t.id]), gecerli(sinir[t.id], t) && n(sinir[t.id]) > 0 ? n(sinir[t.id]) : null),
  );
  const dereceli = sonuclar.filter((s) => s.derece !== null);
  const enYuksek = dereceli.length > 0 ? Math.max(...dereceli.map((s) => s.derece as number)) : null;
  const belirsizSayi = sonuclar.filter((s) => s.belirsiz).length;

  return (
    <OlcekKabugu
      slug="ctcae-laboratuvar"
      ikon="🧪"
      baslik="CTCAE Laboratuvar Derecelendirme"
      altBaslik="CTCAE v5.0 · Sitopeni, Karaciğer ve Böbrek Advers Olayları"
      paylasim={{ derece: enYuksek }}
      not={
        <p>
          Derece, doz erteleme ve azaltma kararlarının ortak dilidir ama kararın kendisi rejimin protokolünden gelir. Karaciğer ve böbrek dereceleri
          BAŞLANGIÇTA normal olan hasta için tanımlıdır; başlangıçta yüksek değerlerde CTCAE ayrı ("baseline anormal") kuralları kullanır. Febril
          nötropeni, kanama ve transfüzyon gereksinimi gibi klinik olaylar ayrı başlıklardır ve laboratuvar derecesinden bağımsız değerlendirilir.
          CTCAE v5.0, 2017.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
        <p className="text-[12px] font-black text-blue-900">Girilen her analit derecelendirilir — hepsini doldurmak gerekmez</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TANIMLAR.map((t) => (
            <div key={t.id} className="flex gap-3 min-w-0">
              <label className="flex flex-col gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{t.ad} ({t.birim})</span>
                <input type="text" inputMode="decimal" value={deger[t.id] ?? ""} onChange={(e) => setDeger((o) => ({ ...o, [t.id]: e.target.value }))} className={girdi} />
              </label>
              <label className="flex flex-col gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t.sinirAdi}</span>
                <input type="text" inputMode="decimal" value={sinir[t.id] ?? ""} onChange={(e) => setSinir((o) => ({ ...o, [t.id]: e.target.value }))} className={girdi} />
              </label>
            </div>
          ))}
        </div>
      </div>
      <BinlikUyari girdiler={[{ ad: "Mutlak nötrofil", ham: deger.anc ?? "" }, { ad: "Trombosit", ham: deger.plt ?? "" }]} />

      <SonucDuyuru metin={enYuksek !== null ? `En yüksek derece ${enYuksek}` : null} />
      {sonuclar.length > 0 ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${enYuksek !== null ? RENK[enYuksek] : "border-slate-200 bg-slate-50 text-slate-800"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">CTCAE v5.0</p>
          <p className="text-4xl font-black">{enYuksek !== null ? `Derece ${enYuksek}` : "Derecelendirilemedi"}</p>
          <ul className="space-y-1">
            {sonuclar.map((s) => (
              <li key={s.t.id} className="text-[12px] font-bold">{s.t.ad} {sayi(s.deger)} {s.t.birim} — {s.metin}</li>
            ))}
          </ul>
          {belirsizSayi > 0 && <p className="text-[12px] font-bold">{belirsizSayi} analitte yerel sınır girilmedi — o analitler en yüksek dereceye KATILMADI.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">En az bir laboratuvar değeri girin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
