"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Fried Kırılganlık Fenotipi — Fried ve ark., J Gerontol A 2001 (Cardiovascular Health Study).
 *
 * Beş ölçütün ikisi ÖLÇÜMDEN hesaplanıyor ve eşikleri kişiye göre değişiyor:
 *   kavrama gücü → cinsiyet + BKİ çeyreği
 *   4,57 m (15 ft) yürüme süresi → cinsiyet + boy
 * Kullanıcı bu iki ölçütü "var/yok" diye seçmiyor; eşik tablosunu araç uyguluyor ve
 * hangi eşiğin kullanıldığını yanında yazıyor (ekranda ilan ≡ uygulanan).
 */
type Cinsiyet = "male" | "female";

/** Kavrama gücü eşikleri: BKİ üst sınırı → bu değer ve altı ölçütü karşılar (kg). */
const KAVRAMA: Record<Cinsiyet, ReadonlyArray<{ bkiUst: number; bkiEtiket: string; esik: number }>> = {
  male: [
    { bkiUst: 24, bkiEtiket: "BKİ ≤ 24", esik: 29 },
    { bkiUst: 26, bkiEtiket: "BKİ 24,1–26", esik: 30 },
    { bkiUst: 28, bkiEtiket: "BKİ 26,1–28", esik: 30 },
    { bkiUst: Infinity, bkiEtiket: "BKİ > 28", esik: 32 },
  ],
  female: [
    { bkiUst: 23, bkiEtiket: "BKİ ≤ 23", esik: 17 },
    { bkiUst: 26, bkiEtiket: "BKİ 23,1–26", esik: 17.3 },
    { bkiUst: 29, bkiEtiket: "BKİ 26,1–29", esik: 18 },
    { bkiUst: Infinity, bkiEtiket: "BKİ > 29", esik: 21 },
  ],
};

/** Yürüme süresi eşikleri: boy sınırı (cm) ve altı için 7 sn, üstü için 6 sn — bu süre ve üstü karşılar. */
const YURUME: Record<Cinsiyet, { boySinir: number; kisaEsik: number; uzunEsik: number }> = {
  male: { boySinir: 173, kisaEsik: 7, uzunEsik: 6 },
  female: { boySinir: 159, kisaEsik: 7, uzunEsik: 6 },
};

const BOY_ALT = 120;
const BOY_UST = 250;
const KAVRAMA_UST = 100;
const SURE_UST = 120;

const VAR_YOK: Secenek[] = [
  { label: "Yok", pts: 0 },
  { label: "Var", pts: 1 },
];

const SORULAR: ReadonlyArray<{ id: string; baslik: string; aciklama: string }> = [
  {
    id: "kilo",
    baslik: "1. İstemsiz kilo kaybı",
    aciklama: "Son 1 yılda istemeden > 4,5 kg ya da vücut ağırlığının ≥ %5'i.",
  },
  {
    id: "yorgunluk",
    baslik: "2. Bitkinlik (öz bildirim)",
    aciklama:
      "CES-D'nin iki sorusundan en az birine \"haftada 3 gün ya da daha sık\" yanıtı: \"Yaptığım her şey bana çaba gerektiriyordu\" · \"Bir türlü harekete geçemedim\".",
  },
  {
    id: "aktivite",
    baslik: "5. Düşük fiziksel aktivite",
    aciklama: "Haftalık boş zaman etkinliği harcaması erkekte < 383 kcal, kadında < 270 kcal (özgün çalışmada Minnesota Boş Zaman Etkinliği Anketi).",
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Sağlam", alt: "Kırılganlık ölçütü yok.", renk: "emerald" },
  { aralik: "1–2", etiket: "Kırılganlık öncesi", alt: "Pre-frail — ilerleme riski; egzersiz ve beslenme odaklı önleme.", renk: "amber" },
  { aralik: "3–5", etiket: "Kırılgan", alt: "Düşme, yeti yitimi, hastaneye yatış ve ölüm riski artmış — kapsamlı geriatrik değerlendirme.", renk: "rose" },
];

const girdiSinifi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg";
const tr = (n: number) => String(n).replace(".", ",");

export default function FriedPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(SORULAR.map((s) => [s.id, null])));
  const [cinsiyet, setCinsiyet] = React.useState<Cinsiyet | null>(null);
  const [kilo, setKilo] = React.useState("");
  const [boy, setBoy] = React.useState("");
  const [kavrama, setKavrama] = React.useState("");
  const [sure, setSure] = React.useState("");

  const kiloN = parseLocaleNumber(kilo);
  const boyN = parseLocaleNumber(boy);
  const kavramaN = parseLocaleNumber(kavrama);
  const sureN = parseLocaleNumber(sure);

  const kiloOk = kiloMakulMu(kilo);
  const boyOk = sayiGirildiMi(boy) && boyN >= BOY_ALT && boyN <= BOY_UST;
  // Meşru sıfır: kavrama gücü 0 kg (hiç sıkamıyor) geçerli bir ölçüm.
  const kavramaOk = sayiGirildiMi(kavrama) && kavramaN >= 0 && kavramaN <= KAVRAMA_UST;
  // Yürüme süresi 0 sn fiziksel olarak olanaksız.
  const sureOk = sayiGirildiMi(sure) && sureN > 0 && sureN <= SURE_UST;

  // Eşik tablosu 0,1 çözünürlükte (24 / 24,1); sınıflama EKRANDA GÖRÜNEN değerle yapılır,
  // yoksa 24,04 "24,0" yazılıp "24,1–26" bandına düşerdi.
  const bki = kiloOk && boyOk ? Math.round((kiloN / (boyN / 100) ** 2) * 10) / 10 : null;
  const kavramaSatir = cinsiyet && bki !== null ? KAVRAMA[cinsiyet].find((s) => bki <= s.bkiUst)! : null;
  const kavramaOlcut = kavramaSatir && kavramaOk ? (kavramaN <= kavramaSatir.esik ? 1 : 0) : null;

  const yurumeEsik = cinsiyet && boyOk ? (boyN <= YURUME[cinsiyet].boySinir ? YURUME[cinsiyet].kisaEsik : YURUME[cinsiyet].uzunEsik) : null;
  const yurumeOlcut = yurumeEsik !== null && sureOk ? (sureN >= yurumeEsik ? 1 : 0) : null;

  const eksikler = [
    ...SORULAR.filter((s) => sel[s.id] === null).map((s) => s.baslik.replace(/^\d\. /, "")),
    cinsiyet === null && "cinsiyet",
    !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    !boyOk && `boy (${BOY_ALT}–${BOY_UST} cm)`,
    !kavramaOk && `kavrama gücü (0–${KAVRAMA_UST} kg)`,
    !sureOk && `yürüme süresi (en fazla ${SURE_UST} sn)`,
  ].filter(Boolean) as string[];

  const skor =
    eksikler.length === 0 && kavramaOlcut !== null && yurumeOlcut !== null
      ? SORULAR.reduce((t, s) => t + VAR_YOK[sel[s.id] as number].pts, 0) + kavramaOlcut + yurumeOlcut
      : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor <= 2 ? BANTLAR[1] : BANTLAR[2];

  const secSorusu = (s: (typeof SORULAR)[number]) => (
    <SecimMaddesi
      key={s.id}
      id={s.id}
      baslik={s.baslik}
      aciklama={s.aciklama}
      secenekler={VAR_YOK}
      secili={sel[s.id]}
      onSec={(v) => setSel((o) => ({ ...o, [s.id]: v }))}
    />
  );

  const olcutEtiketi = (v: number | null) =>
    v === null ? "—" : v === 1 ? "Ölçüt KARŞILANIYOR (+1)" : "Ölçüt karşılanmıyor (0)";

  return (
    <OlcekKabugu
      slug="fried-fenotip"
      ikon="🏃"
      baslik="Fried Kırılganlık Fenotipi"
      altBaslik="Cardiovascular Health Study · 5 Ölçüt · 0–5"
      paylasim={{ fried: skor }}
      not={
        <p>
          Kavrama gücü el dinamometresiyle (baskın el, üç ölçümün en yükseği), yürüme süresi olağan hızda 4,57 m (15 ft) üzerinden ölçülür.
          Eşikler özgün CHS kohortunun en alt %20'lik dilimidir (cinsiyet ve BKİ/boy çeyreğine göre); farklı toplumlarda farklı kesim değerleri önerilmiştir.
          Fried LP ve ark., J Gerontol A Biol Sci Med Sci 2001.
        </p>
      }
    >
      <div className="space-y-3">{SORULAR.slice(0, 2).map(secSorusu)}</div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <p className="text-[12px] font-black text-blue-900">Ölçümler — 3. kavrama gücü ve 4. yürüme hızı</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div role="radiogroup" aria-labelledby="fried-cinsiyet" className="flex flex-col gap-2 sm:col-span-2">
            <span id="fried-cinsiyet" className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cinsiyet</span>
            <div className="flex gap-2 sm:max-w-sm">
              {(["male", "female"] as const).map((c) => (
                <label
                  key={c}
                  className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer
                    ${cinsiyet === c ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  <input type="radio" name="fried-cinsiyet" className="sr-only" checked={cinsiyet === c} onChange={() => setCinsiyet(c)} />
                  {c === "male" ? "Erkek" : "Kadın"}
                </label>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ağırlık (kg)</span>
            <input type="text" inputMode="decimal" value={kilo} onChange={(e) => setKilo(e.target.value)} className={girdiSinifi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Boy (cm)</span>
            <input type="text" inputMode="decimal" value={boy} onChange={(e) => setBoy(e.target.value)} className={girdiSinifi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kavrama gücü (kg)</span>
            <input type="text" inputMode="decimal" value={kavrama} onChange={(e) => setKavrama(e.target.value)} className={girdiSinifi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">4,57 m yürüme süresi (sn)</span>
            <input type="text" inputMode="decimal" value={sure} onChange={(e) => setSure(e.target.value)} className={girdiSinifi} />
          </label>
        </div>

        <BinlikUyari girdiler={[{ ad: "Ağırlık", ham: kilo }]} />

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <dt className="font-black text-blue-900">3. Kavrama gücü</dt>
            <dd className="text-slate-700 mt-1">
              {kavramaSatir
                ? `${kavramaSatir.bkiEtiket} (BKİ ${tr(bki!)}) → eşik ≤ ${tr(kavramaSatir.esik)} kg`
                : "Eşik için cinsiyet, ağırlık ve boy gerekli"}
            </dd>
            <dd className="font-black text-slate-800 mt-1">{olcutEtiketi(kavramaOlcut)}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <dt className="font-black text-blue-900">4. Yürüme yavaşlığı</dt>
            <dd className="text-slate-700 mt-1">
              {yurumeEsik !== null && cinsiyet
                ? `Boy ${boyN <= YURUME[cinsiyet].boySinir ? "≤" : ">"} ${YURUME[cinsiyet].boySinir} cm → eşik ≥ ${yurumeEsik} sn`
                : "Eşik için cinsiyet ve boy gerekli"}
            </dd>
            <dd className="font-black text-slate-800 mt-1">{olcutEtiketi(yurumeOlcut)}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">{SORULAR.slice(2).map(secSorusu)}</div>

      <SkorPaneli
        skor={skor}
        payda={5}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksikler.join(" · ")}`}
      />
    </OlcekKabugu>
  );
}
