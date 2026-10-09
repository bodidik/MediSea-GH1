"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Osteoporozda kırık riski kategorisi — TEMD Osteoporoz ve Metabolik Kemik Hastalıkları Tanı ve Tedavi Kılavuzu 2025,
 * Tablo 6 "Osteoporoz risk kategorileri ve özellikleri" (s. 21). Hasta, ölçütlerinden BİRİNİ karşıladığı en yüksek kategoriye yazılır.
 *   Çok yüksek: FRAX kalça ≥ %4,6 ya da majör ≥ %30 · T < −3,0 · çoklu vertebra kırığı · tedavi altında kırık · ilaç yan etkisiyle kırık
 *               (uzun steroid gibi) · yaralanmalı düşme öyküsü ya da yüksek düşme riski · T < −2,5 ile birlikte vertebra kırığı,
 *               hormon ablasyon tedavisi ya da devam eden glukokortikoid
 *   Yüksek:     FRAX kalça ≥ %3 ya da majör ≥ %20 · T ≤ −2,5 · kalça ya da vertebra kırığı (KMY'den bağımsız; yeni vertebra kırığı) · > 75 yaş
 *   Orta:       T −1,0 ile −2,5 arası ve bir klinik risk faktörü · kalça/vertebra dışı osteoporotik kırık
 *   Düşük:      T > −1,0 · < 65 yaş, T > −2,5 ve klinik risk faktörü yok
 * Tablodaki FRAX satırında "vertebra" diye yazılan sütun majör osteoporotik kırık olasılığıdır (metin s. 20: kalça ≥ %3, majör ≥ %20).
 * Tablo, osteopenik ve ≥ 65 yaşında klinik risk faktörü olmayan hastayı açıkça yerleştirmiyor — burada KMY satırına göre ORTA.
 * Anabolikle başlama ölçütü (postmenopozal kadın, s. 124): son 2 yılda vertebra kırığı · ≥ 2 vertebra kırığı · T ≤ −3,5 ·
 *   > 3 ay ≥ 7,5 mg/gün prednizolon eşdeğeri · yakın zamanda frajilite kırığı ile birlikte birden fazla klinik risk faktörü.
 * Eşiklerle HAM değer karşılaştırılıyor.
 */
type Madde = { id: string; ad: string };
const MADDELER: ReadonlyArray<Madde> = [
  { id: "kalca", ad: "Kalça kırığı öyküsü" },
  { id: "vertebra", ad: "Vertebra kırığı (klinik ya da morfometrik)" },
  { id: "yeniVertebra", ad: "Son 2 yıl içinde vertebra kırığı" },
  { id: "coklu", ad: "Çoklu (≥ 2) vertebra kırığı" },
  { id: "diger", ad: "Kalça ve vertebra dışı osteoporotik kırık (önkol, humerus, pelvis…)" },
  { id: "yakin", ad: "Yakın zamanda frajilite kırığı" },
  { id: "tedaviAlti", ad: "Osteoporoz tedavisi altında kırık" },
  { id: "ilac", ad: "İlaç yan etkisiyle kırık (uzun süreli steroid gibi)" },
  { id: "dusme", ad: "Yaralanmalı düşme öyküsü ya da yüksek düşme riski" },
  { id: "ablasyon", ad: "Hormon ablasyon tedavisi (aromataz inhibitörü, androjen deprivasyonu)" },
  { id: "gk", ad: "Devam eden glukokortikoid tedavisi" },
  { id: "gkYuksek", ad: "> 3 ay boyunca ≥ 7,5 mg/gün prednizolon (ya da eşdeğeri)" },
];
const KRF: Secenek[] = [{ label: "Yok", pts: 0 }, { label: "1", pts: 1 }, { label: "≥ 2", pts: 2 }];
const KAT = [
  { ad: "Düşük risk", r: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  { ad: "Orta risk", r: "border-amber-200 bg-amber-50 text-amber-900" },
  { ad: "Yüksek risk", r: "border-orange-200 bg-orange-50 text-orange-900" },
  { ad: "Çok yüksek risk", r: "border-rose-200 bg-rose-50 text-rose-900" },
] as const;
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
// Eşik sınırında yuvarlama yanıltmasın (−1,01 "−1,0" görünüp osteopeni demesin): en fazla iki ondalık, sondaki sıfırlar atılır.
const v1 = (x: number) => { const s = String(Number(x.toFixed(2))).replace(".", ",").replace("-", "−"); return s.includes(",") ? s : s + ",0"; };

export default function TemdKirikRiskiPage() {
  const [tSkor, setTSkor] = React.useState("");
  const [kalcaF, setKalcaF] = React.useState("");
  const [majorF, setMajorF] = React.useState("");
  const [yas, setYas] = React.useState("");
  const [krf, setKrf] = React.useState<number | null>(null);
  const [var_, setVar] = React.useState<Record<string, boolean>>({});
  const n = parseLocaleNumber;
  const alan = (s: string, alt: number, ust: number) => ({ gir: sayiGirildiMi(s), ok: sayiGirildiMi(s) && n(s) >= alt && n(s) <= ust });
  const T = alan(tSkor, -8, 6), H = alan(kalcaF, 0, 100), M = alan(majorF, 0, 100), Y = alan(yas, 18, 110);
  const hatali = [
    T.gir && !T.ok && "T skoru −8 ile +6 arasında olmalı",
    H.gir && !H.ok && "FRAX kalça %0–100 olmalı",
    M.gir && !M.ok && "FRAX majör %0–100 olmalı",
    Y.gir && !Y.ok && "yaş 18–110 olmalı",
  ].filter(Boolean) as string[];

  const t = T.ok ? n(tSkor) : null;
  const h = H.ok ? n(kalcaF) : null;
  const m = M.ok ? n(majorF) : null;
  const y = Y.ok ? n(yas) : null;
  const v = (id: string) => !!var_[id];
  // KMY ya da FRAX yoksa "düşük/orta" söylenemez; ama KMY'den bağımsız yüksek/çok yüksek ölçütü tek başına kategori verir.
  const hesaplanir = t !== null || h !== null || m !== null;

  const gerekce: [number, string][] = [];
  {
    if (h !== null && h >= 4.6) gerekce.push([3, `FRAX kalça %${v1(h)} ≥ %4,6`]);
    if (m !== null && m >= 30) gerekce.push([3, `FRAX majör %${v1(m)} ≥ %30`]);
    if (t !== null && t < -3) gerekce.push([3, `T skoru ${v1(t)} < −3,0`]);
    if (v("coklu")) gerekce.push([3, "çoklu vertebra kırığı"]);
    if (v("tedaviAlti")) gerekce.push([3, "tedavi altında kırık"]);
    if (v("ilac")) gerekce.push([3, "ilaç yan etkisiyle kırık"]);
    if (v("dusme")) gerekce.push([3, "yaralanmalı düşme / yüksek düşme riski"]);
    if (t !== null && t < -2.5 && (v("vertebra") || v("yeniVertebra") || v("ablasyon") || v("gk")))
      gerekce.push([3, `T < −2,5 ile birlikte ${[(v("vertebra") || v("yeniVertebra")) && "vertebra kırığı", v("ablasyon") && "hormon ablasyonu", v("gk") && "devam eden glukokortikoid"].filter(Boolean).join(", ")}`]);
    if (h !== null && h >= 3 && h < 4.6) gerekce.push([2, `FRAX kalça %${v1(h)} ≥ %3`]);
    if (m !== null && m >= 20 && m < 30) gerekce.push([2, `FRAX majör %${v1(m)} ≥ %20`]);
    if (t !== null && t <= -2.5 && t >= -3) gerekce.push([2, `T skoru ${v1(t)} ≤ −2,5`]);
    if (v("kalca")) gerekce.push([2, "kalça kırığı (KMY'den bağımsız)"]);
    if (v("vertebra") || v("yeniVertebra")) gerekce.push([2, "vertebra kırığı (KMY'den bağımsız)"]);
    if (y !== null && y > 75) gerekce.push([2, "75 yaş üstü"]);
    if (v("diger")) gerekce.push([1, "kalça ve vertebra dışı osteoporotik kırık"]);
    if (t !== null && t > -2.5 && t < -1) {
      const dusukIstisna = y !== null && y < 65 && krf === 0;
      if (!dusukIstisna) gerekce.push([1, `osteopeni (T ${v1(t)})${krf !== null && krf > 0 ? " + klinik risk faktörü" : y !== null && y >= 65 ? ", ≥ 65 yaş" : ""}`]);
      else gerekce.push([0, `osteopeni, < 65 yaş, klinik risk faktörü yok`]);
    }
  }
  const enUst = Math.max(0, ...gerekce.map(([k]) => k));
  const kat = hesaplanir || enUst >= 2 ? enUst : null;
  const ustGerekce = kat === null ? [] : gerekce.filter(([k]) => k === kat).map(([, g]) => g);

  const anabolik = [
    v("yeniVertebra") && "son 2 yılda vertebra kırığı",
    v("coklu") && "≥ 2 vertebra kırığı",
    t !== null && t <= -3.5 && "T ≤ −3,5",
    v("gkYuksek") && "yüksek doz glukokortikoid",
    v("yakin") && krf === 2 && "yakın kırık + birden fazla klinik risk faktörü",
  ].filter(Boolean) as string[];

  const eksik = kat === null ? ["T skoru ya da FRAX"] : [];

  return (
    <OlcekKabugu
      slug="temd-kirik-riski"
      ikon="🦴"
      baslik="Osteoporoz Kırık Riski Kategorisi (TEMD)"
      altBaslik="TEMD 2025 · Düşük · Orta · Yüksek · Çok Yüksek · Anabolik Başlama Ölçütü"
      paylasim={{ kategori: kat }}
      not={
        <p>
          Kategori, karşılanan en yüksek ölçüte göre verilir; tablo kırık risk faktörlerini hücreler arasında örtüşerek tanımladığı için klinik yargının
          yerini tutmaz. FRAX değerini Türkiye modeliyle (FRAX sitesi, ülke: Türkiye) hesaplayın. TEMD'ye göre çok yüksek riskte ya da kırık öyküsünde
          anabolik ajan, denosumab ya da zoledronat; yüksek riskte bisfosfonat ya da denosumab ilk seçenektir. TEMD Osteoporoz ve Metabolik Kemik
          Hastalıkları Tanı ve Tedavi Kılavuzu 2025, Tablo 6 (s. 21) ve Osteoporoz Tedavisi (s. 124).
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["En düşük T skoru", tSkor, setTSkor],
          ["Yaş (yıl)", yas, setYas],
          ["FRAX 10 yıllık kalça kırığı (%)", kalcaF, setKalcaF],
          ["FRAX 10 yıllık majör osteoporotik kırık (%)", majorF, setMajorF],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      <SecimMaddesi id="krf" baslik="Klinik risk faktörü sayısı" aciklama="FRAX'taki faktörler: ailede kalça kırığı, sigara, alkol ≥ 3 ünite/gün, glukokortikoid, romatoid artrit, sekonder osteoporoz nedeni, BKİ < 20." secenekler={KRF} secili={krf} onSec={setKrf} rozetGizle />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <p id="madde-oyku" className="text-[12px] font-black text-blue-900 leading-snug">Kırık ve klinik özellikler (olanları işaretleyin)</p>
        <div role="group" aria-labelledby="madde-oyku" className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {MADDELER.map((md) => {
            const aktif = v(md.id);
            return (
              <button
                key={md.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => setVar((o) => ({ ...o, [md.id]: !aktif }))}
                className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-left text-[11px] font-bold transition-all ${aktif ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"}`}
              >
                {md.ad}
              </button>
            );
          })}
        </div>
      </div>

      {hatali.length > 0 && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{hatali.join(" · ")}</p>
      )}

      <SonucDuyuru metin={kat !== null ? `${KAT[kat].ad}${ustGerekce.length ? " — " + ustGerekce.join("; ") : ""}${anabolik.length ? ". Anabolikle başlama ölçütü var" : ""}` : null} />
      {kat !== null ? (
        <div className="space-y-3">
          <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${KAT[kat].r}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">TEMD 2025 risk kategorisi</p>
            <p className="text-3xl font-black">{KAT[kat].ad}</p>
            <p className="text-[12px] font-bold">
              {ustGerekce.length ? "Gerekçe: " + ustGerekce.join(" · ") : t !== null && t >= -1 ? `T skoru ${v1(t)} > −1,0, üst kategori ölçütü yok.` : "Üst kategori ölçütü yok."}
            </p>
            {t === null && <p className="text-[11px] font-bold">T skoru girilmedi — KMY ölçütleri değerlendirilmedi.</p>}
            {(h === null || m === null) && <p className="text-[11px] font-bold">FRAX eksik — FRAX ölçütleri değerlendirilmedi.</p>}
          </div>
          {anabolik.length > 0 && (
            <p className="text-[12px] font-bold text-blue-950 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              Postmenopozal kadında anabolik ajanla (teriparatid, abaloparatid, romosozumab) başlama ölçütü: {anabolik.join(" · ")}.
            </p>
          )}
        </div>
      ) : (
        eksik.length > 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
          </div>
        )
      )}
    </OlcekKabugu>
  );
}
