"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Düzeltilmiş QT (QTc) — dört formül yan yana.
 *   Bazett      QT / √RR
 *   Fridericia  QT / ∛RR
 *   Framingham  QT + 154 × (1 − RR)
 *   Hodges      QT + 1,75 × (KH − 60)
 * RR saniye cinsinden (60 / kalp hızı).
 *
 * Bant, SEÇİLEN formülün değerinden hesaplanıyor ve cinsiyete bağlı (uzun QT eşiği erkekte
 * 450, kadında 460 ms). Varsayılan Fridericia: Bazett yüksek kalp hızında QTc'yi olduğundan
 * uzun, düşük hızda kısa gösterir.
 */
const QT_ALT = 200;
const QT_UST = 800;
const KH_ALT = 30;
const KH_UST = 220;

type Formul = "fridericia" | "bazett" | "framingham" | "hodges";
const FORMULLER: ReadonlyArray<{ id: Formul; ad: string; ifade: string }> = [
  { id: "fridericia", ad: "Fridericia", ifade: "QT / ∛RR" },
  { id: "bazett", ad: "Bazett", ifade: "QT / √RR" },
  { id: "framingham", ad: "Framingham", ifade: "QT + 154 × (1 − RR)" },
  { id: "hodges", ad: "Hodges", ifade: "QT + 1,75 × (KH − 60)" },
];

function hesapla(f: Formul, qt: number, kh: number): number {
  const rr = 60 / kh;
  switch (f) {
    case "bazett": return qt / Math.sqrt(rr);
    case "fridericia": return qt / Math.cbrt(rr);
    case "framingham": return qt + 154 * (1 - rr);
    case "hodges": return qt + 1.75 * (kh - 60);
  }
}

type Cinsiyet = "male" | "female";
const UZUN_ESIK: Record<Cinsiyet, number> = { male: 450, female: 460 };
const KISA_ESIK = 350;
const COK_UZUN = 500;

function bantlar(c: Cinsiyet): Bant[] {
  return [
    { aralik: `< ${KISA_ESIK}`, etiket: "Kısa QTc", alt: "Kısa QT sendromu açısından değerlendirin (özellikle < 340 ms ve öykü varsa); hiperkalsemi, digoksin.", renk: "amber" },
    { aralik: `${KISA_ESIK}–${UZUN_ESIK[c] - 1}`, etiket: "Normal", alt: "QTc normal aralıkta.", renk: "emerald" },
    { aralik: `${UZUN_ESIK[c]}–${COK_UZUN}`, etiket: "Uzun QTc", alt: "QT uzatan ilaçları, K⁺/Mg²⁺/Ca²⁺ düzeylerini gözden geçirin; bazal değere göre artış > 60 ms de anlamlıdır.", renk: "orange" },
    { aralik: `> ${COK_UZUN}`, etiket: "Belirgin uzun QTc", alt: "Torsades de pointes riski yüksek — QT uzatan ilaçları kesin, elektrolitleri düzeltin, monitörize izleyin.", renk: "rose" },
  ];
}

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function QtcPage() {
  const [qt, setQt] = React.useState("");
  const [kipKh, setKipKh] = React.useState<"kh" | "rr">("kh");
  const [kh, setKh] = React.useState("");
  const [rr, setRr] = React.useState("");
  const [cinsiyet, setCinsiyet] = React.useState<Cinsiyet>("male");
  const [formul, setFormul] = React.useState<Formul>("fridericia");

  const qtN = parseLocaleNumber(qt);
  const qtOk = sayiGirildiMi(qt) && qtN >= QT_ALT && qtN <= QT_UST;
  const rrN = parseLocaleNumber(rr);
  const khHam = kipKh === "kh" ? parseLocaleNumber(kh) : sayiGirildiMi(rr) && rrN > 0 ? 60000 / rrN : NaN;
  const khOk = (kipKh === "kh" ? sayiGirildiMi(kh) : sayiGirildiMi(rr)) && Number.isFinite(khHam) && khHam >= KH_ALT && khHam <= KH_UST;

  const eksik = [
    !qtOk && `QT (${QT_ALT}–${QT_UST} ms)`,
    !khOk && (kipKh === "kh" ? `kalp hızı (${KH_ALT}–${KH_UST}/dk)` : `RR aralığı (${Math.round(60000 / KH_UST)}–${60000 / KH_ALT} ms)`),
  ].filter(Boolean) as string[];

  const degerler = qtOk && khOk ? FORMULLER.map((f) => ({ ...f, deger: Math.round(hesapla(f.id, qtN, khHam)) })) : null;
  const secilen = degerler?.find((d) => d.id === formul)?.deger ?? null;
  const B = bantlar(cinsiyet);
  const bant = secilen === null ? null : secilen < KISA_ESIK ? B[0] : secilen < UZUN_ESIK[cinsiyet] ? B[1] : secilen <= COK_UZUN ? B[2] : B[3];

  const radyo = (ad: string, secenekler: ReadonlyArray<readonly [string, string]>, deger: string, onSec: (v: string) => void, adId: string) => (
    <div role="radiogroup" aria-labelledby={adId} className="flex flex-col gap-2">
      <span id={adId} className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
      <div className="flex flex-wrap gap-2">
        {secenekler.map(([k, etiket]) => (
          <label
            key={k}
            className={`flex-1 min-w-[5.5rem] min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer text-center px-2
              ${deger === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
          >
            <input type="radio" name={adId} className="sr-only" checked={deger === k} onChange={() => onSec(k)} />
            {etiket}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <OlcekKabugu
      slug="qtc"
      ikon="📈"
      baslik="QTc Hesaplayıcı"
      altBaslik="Bazett · Fridericia · Framingham · Hodges"
      paylasim={{ qtc: secilen, formul }}
      not={
        <>
          <p>
            QT, QRS başlangıcından T dalgasının sonuna ölçülür (tercihen DII ya da V5, en uzun derivasyon); U dalgası dahil edilmez. Dal bloğunda QRS genişliği
            QT'yi uzatır — JT aralığı ya da düzeltilmiş formüller kullanılabilir. AF'de birkaç atımın ortalaması alınır.
          </p>
          <p>Rautaharju PM ve ark., AHA/ACCF/HRS önerileri, Circulation 2009.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">QT aralığı (ms)</span>
            <input type="text" inputMode="numeric" value={qt} onChange={(e) => setQt(e.target.value)} placeholder="ör. 420" className={girdi} />
          </label>
          {radyo("Cinsiyet", [["male", "Erkek"], ["female", "Kadın"]], cinsiyet, (v) => setCinsiyet(v as Cinsiyet), "qtc-cinsiyet")}
          {radyo("Hız girdisi", [["kh", "Kalp hızı"], ["rr", "RR aralığı"]], kipKh, (v) => setKipKh(v as "kh" | "rr"), "qtc-kip")}
          {kipKh === "kh" ? (
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Kalp hızı (/dk)</span>
              <input type="text" inputMode="numeric" value={kh} onChange={(e) => setKh(e.target.value)} placeholder="ör. 75" className={girdi} />
            </label>
          ) : (
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">RR aralığı (ms)</span>
              <input type="text" inputMode="numeric" value={rr} onChange={(e) => setRr(e.target.value)} placeholder="ör. 800" className={girdi} />
            </label>
          )}
        </div>
        {radyo("Bandı belirleyen formül", FORMULLER.map((f) => [f.id, f.ad] as const), formul, (v) => setFormul(v as Formul), "qtc-formul")}
      </div>

      <SkorPaneli
        skor={secilen}
        skorBasligi="QTc ms"
        bantlar={B}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={
          degerler ? (
            <table className="w-full text-[12px] bg-white/70 rounded-xl overflow-hidden">
              <caption className="sr-only">Dört formülle QTc</caption>
              <thead>
                <tr className="text-left text-slate-600">
                  <th scope="col" className="px-3 py-2">Formül</th>
                  <th scope="col" className="px-3 py-2">QTc (ms)</th>
                </tr>
              </thead>
              <tbody>
                {degerler.map((d) => (
                  <tr key={d.id} className={d.id === formul ? "font-black text-blue-900" : "text-slate-700"}>
                    <th scope="row" className="px-3 py-1.5 text-left font-[inherit]">
                      {d.ad} <span className="font-normal text-slate-600">{d.ifade}</span>{d.id === formul ? " (bant)" : ""}
                    </th>
                    <td className="px-3 py-1.5">{d.deger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
