"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { KILO_ALT, KILO_UST, bsaMosteller, kiloMakulMu, parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Trombosit transfüzyonunda düzeltilmiş sayım artışı (CCI — corrected count increment).
 *   CCI = sayım artışı (/µL) × VYA (m²) / verilen trombosit sayısı (× 10¹¹)
 * Sayım × 10⁹/L olarak giriliyor = × 10³/µL; artış /µL için 1000 ile çarpılıyor.
 * Refrakterlik: transfüzyondan 10–60 dk sonra CCI < 7500 ya da 18–24 saat sonra < 5000, ARDIŞIK iki transfüzyonda.
 *
 * VYA ortak `bsaMosteller`'dan; kilo aralığı ortak KILO_ALT/KILO_UST'tan.
 */
const ZAMAN: Secenek[] = [{ label: "10–60 dakika sonra", pts: 0 }, { label: "18–24 saat sonra", pts: 0 }];
const ESIK = [7500, 5000] as const;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function TrombositCciPage() {
  const [once, setOnce] = React.useState("");
  const [sonra, setSonra] = React.useState("");
  const [doz, setDoz] = React.useState("");
  const [kilo, setKilo] = React.useState("");
  const [boy, setBoy] = React.useState("");
  const [zaman, setZaman] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const onceOk = sayiGirildiMi(once) && n(once) >= 0 && n(once) <= 1000;
  const sonraOk = sayiGirildiMi(sonra) && n(sonra) >= 0 && n(sonra) <= 1000;
  const dozOk = sayiGirildiMi(doz) && n(doz) >= 0.5 && n(doz) <= 20;
  const kiloOk = kiloMakulMu(kilo);
  const boyOk = sayiGirildiMi(boy) && n(boy) >= 120 && n(boy) <= 250;

  const eksik = [
    !onceOk && "transfüzyon öncesi trombosit",
    !sonraOk && "transfüzyon sonrası trombosit",
    !dozOk && "verilen trombosit (0,5–20 × 10¹¹)",
    !kiloOk && `ağırlık (${KILO_ALT}–${KILO_UST} kg)`,
    !boyOk && "boy (120–250 cm)",
    zaman === null && "ölçüm zamanı",
  ].filter(Boolean) as string[];

  const hazir = eksik.length === 0;
  const bsa = kiloOk && boyOk ? bsaMosteller(n(boy), n(kilo)) : null;
  const artis = onceOk && sonraOk ? (n(sonra) - n(once)) * 1000 : null;
  const cci = hazir ? Math.round((artis! * bsa!) / n(doz)) : null;
  const esik = zaman !== null ? ESIK[zaman] : null;
  const yetersiz = cci !== null && esik !== null ? cci < esik : null;
  const bin = (x: number) => x.toLocaleString("tr-TR");

  return (
    <OlcekKabugu
      slug="trombosit-cci"
      ikon="🩸"
      baslik="Trombosit Transfüzyonu CCI"
      altBaslik="Düzeltilmiş Sayım Artışı · Refrakterlik Değerlendirmesi"
      paylasim={{ cci }}
      not={
        <p>
          Standart bir aferez ünitesi ~3–4 × 10¹¹, bir random donör ünitesi ~0,5–0,7 × 10¹¹ trombosit içerir; kesin sayı kan merkezinden alınır. Erken (1 saat)
          CCI düşüklüğü immün (HLA/HPA antikoru) refrakterliği, erken normal ama 24 saatte düşük CCI immün olmayan nedenleri (ateş, sepsis, DIC,
          splenomegali, kanama, ilaç) düşündürür. İmmün refrakterlikte HLA uyumlu ya da çapraz uyumlu trombosit istenir.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Transfüzyon öncesi trombosit (× 10⁹/L)", once, setOnce],
          ["Transfüzyon sonrası trombosit (× 10⁹/L)", sonra, setSonra],
          ["Verilen trombosit (× 10¹¹)", doz, setDoz],
          ["Ağırlık (kg)", kilo, setKilo],
          ["Boy (cm)", boy, setBoy],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <BinlikUyari girdiler={[{ ad: "Ağırlık", ham: kilo }]} />
      <SecimMaddesi id="zaman" baslik="Transfüzyon sonrası sayımın zamanı" secenekler={ZAMAN} secili={zaman} onSec={setZaman} rozetGizle />

      <SonucDuyuru metin={cci !== null && yetersiz !== null ? `CCI ${bin(cci)} — ${yetersiz ? "yetersiz yanıt" : "yeterli yanıt"}` : null} />
      {cci !== null && esik !== null && bsa !== null && artis !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yetersiz ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">CCI</p>
          <p className="text-4xl font-black">{bin(cci)}</p>
          <p className="text-lg font-black">{yetersiz ? `Yetersiz yanıt (< ${bin(esik)})` : `Yeterli yanıt (≥ ${bin(esik)})`}</p>
          <p className="text-[12px] font-bold">
            Artış {bin(artis)}/µL × VYA {bsa.toString().replace(".", ",")} m² ÷ {n(doz).toString().replace(".", ",")} × 10¹¹
          </p>
          {yetersiz && <p className="text-[12px] font-bold">Refrakterlik tanısı için ardışık iki transfüzyonda yetersiz yanıt gerekir.</p>}
          {artis < 0 && <p className="text-[12px] font-bold">Sayım transfüzyondan sonra düşmüş — tüketim ya da ölçüm hatası.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
