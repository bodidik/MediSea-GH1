"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Maddrey diskriminan fonksiyonu — alkolik hepatit (Maddrey ve ark., Gastroenterology 1978; Carithers 1989 modifikasyonu).
 *   mDF = 4,6 × (hasta PT − kontrol PT) (sn) + total bilirubin (mg/dL)
 * ≥ 32 ağır alkolik hepatit. PT saniye cinsinden — INR değil; kontrol PT boşsa 12 sn.
 */
const PT_ALT = 5, PT_UST = 150;
const BIL_UST = 80;
const VARSAYILAN_KONTROL = 12;

const BANTLAR: Bant[] = [
  { aralik: "< 32", etiket: "Ağır değil", alt: "Kortikosteroid endikasyonu yok; destek tedavisi, alkol bırakma ve beslenme.", renk: "emerald" },
  { aralik: "≥ 32", etiket: "Ağır alkolik hepatit", alt: "Kısa dönem mortalite yüksek — kontrendikasyon (enfeksiyon, GİS kanaması, böbrek yetmezliği) yoksa prednizolon 40 mg/gün; 7. günde Lille skoru ile yanıt.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function MaddreyPage() {
  const [pt, setPt] = React.useState("");
  const [kontrol, setKontrol] = React.useState("");
  const [bil, setBil] = React.useState("");

  const ptN = parseLocaleNumber(pt), bilN = parseLocaleNumber(bil);
  const kontrolN = kontrol.trim() === "" ? VARSAYILAN_KONTROL : parseLocaleNumber(kontrol);
  const ptOk = sayiGirildiMi(pt) && ptN >= PT_ALT && ptN <= PT_UST;
  const kontrolOk = kontrol.trim() === "" || (sayiGirildiMi(kontrol) && kontrolN >= 8 && kontrolN <= 20);
  const bilOk = sayiGirildiMi(bil) && bilN >= 0 && bilN <= BIL_UST;

  const eksik = [
    !ptOk && `hasta PT (${PT_ALT}–${PT_UST} sn)`,
    !kontrolOk && "kontrol PT (8–20 sn)",
    !bilOk && `total bilirubin (0–${BIL_UST} mg/dL)`,
  ].filter(Boolean) as string[];

  // Hasta PT kontrolden kısaysa fark negatif olur; formül öyle uygulanır (skoru düşürür), kırpılmaz.
  const df = eksik.length === 0 ? Math.round((4.6 * (ptN - kontrolN) + bilN) * 10) / 10 : null;
  const bant = df === null ? null : df >= 32 ? BANTLAR[1] : BANTLAR[0];
  const tr = (n: number) => String(n).replace(".", ",");

  return (
    <OlcekKabugu
      slug="maddrey"
      ikon="🍷"
      baslik="Maddrey Diskriminan Fonksiyonu"
      altBaslik="Alkolik Hepatitte Şiddet · Kortikosteroid Kararı · ≥ 32"
      paylasim={{ mdf: df }}
      not={
        <p>
          Protrombin zamanı saniye olarak girilir; INR ile hesaplanan değerler laboratuvara göre değişir. Bilirubin µmol/L ise 17,1'e bölün. MELD &gt; 20
          de ağır hastalık için kullanılır ve güncel kılavuzlarda sıklıkla tercih edilir. Maddrey WC ve ark., Gastroenterology 1978; Carithers RL ve ark., 1989.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Hasta PT (sn)</span>
          <input type="text" inputMode="decimal" value={pt} onChange={(e) => setPt(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Kontrol PT (sn)</span>
          <input type="text" inputMode="decimal" value={kontrol} onChange={(e) => setKontrol(e.target.value)} placeholder={`boş: ${VARSAYILAN_KONTROL}`} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Total bilirubin (mg/dL)</span>
          <input type="text" inputMode="decimal" value={bil} onChange={(e) => setBil(e.target.value)} className={girdi} />
        </label>
      </div>
      <SkorPaneli
        skor={df}
        skorBasligi="mDF"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={df !== null ? <p className="text-[11px] font-bold text-slate-700">4,6 × ({tr(ptN)} − {tr(kontrolN)}) + {tr(bilN)} = {tr(df)}</p> : null}
      />
    </OlcekKabugu>
  );
}
