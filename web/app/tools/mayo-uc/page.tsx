"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Mayo skoru — ülseratif kolit aktivitesi (Schroeder ve ark., Gastroenterology 1989).
 * Dört alt skor (0–3). Endoskopi yapılmadıysa PARSİYEL Mayo (0–9), yapıldıysa TAM Mayo (0–12);
 * iki kipin eşikleri farklı ve araç hangisini kullandığını yazıyor.
 *
 * Tam Mayo'da remisyon yalnızca toplam ≤ 2 değil, hiçbir alt skor > 1 olmamalı — tek başına
 * toplamla karar vermek "rektal kanama 2, diğerleri 0" hastasını remisyonda gösterirdi.
 */
const DISKI: Secenek[] = [
  { label: "Hastanın olağan sayısında", pts: 0 },
  { label: "Olağandan 1–2 fazla", pts: 1 },
  { label: "Olağandan 3–4 fazla", pts: 2 },
  { label: "Olağandan ≥ 5 fazla", pts: 3 },
];
const KANAMA: Secenek[] = [
  { label: "Görülmüyor", pts: 0 },
  { label: "Dışkı ile birlikte, zamanın yarısından azında çizgi şeklinde kan", pts: 1 },
  { label: "Dışkı ile birlikte çoğu zaman belirgin kan", pts: 2 },
  { label: "Dışkısız yalnızca kan", pts: 3 },
];
const ENDOSKOPI: Secenek[] = [
  { label: "Normal ya da inaktif hastalık", pts: 0 },
  { label: "Hafif: eritem, damarlanmada azalma, hafif frajilite", pts: 1 },
  { label: "Orta: belirgin eritem, damarlanma kaybı, frajilite, erozyon", pts: 2 },
  { label: "Ağır: spontan kanama, ülserasyon", pts: 3 },
  { label: "Endoskopi yapılmadı (parsiyel Mayo)", pts: 0 },
];
const GLOBAL: Secenek[] = [
  { label: "Normal", pts: 0 },
  { label: "Hafif hastalık", pts: 1 },
  { label: "Orta hastalık", pts: 2 },
  { label: "Ağır hastalık", pts: 3 },
];
const YAPILMADI = 4;

const PARSIYEL: Bant[] = [
  { aralik: "0–1", etiket: "Remisyon", alt: "Parsiyel Mayo ile klinik remisyon.", renk: "emerald" },
  { aralik: "2–4", etiket: "Hafif aktif", alt: "Hafif aktif hastalık.", renk: "amber" },
  { aralik: "5–6", etiket: "Orta aktif", alt: "Orta aktif hastalık.", renk: "orange" },
  { aralik: "7–9", etiket: "Ağır aktif", alt: "Ağır aktif hastalık — Truelove-Witts ölçütleriyle akut ağır kolit açısından değerlendirin.", renk: "rose" },
];
const TAM: Bant[] = [
  { aralik: "0–2 (alt skor ≤ 1)", etiket: "Remisyon", alt: "Toplam ≤ 2 ve hiçbir alt skor 1'in üstünde değil.", renk: "emerald" },
  { aralik: "3–5", etiket: "Hafif aktif", alt: "Hafif aktif hastalık (toplam ≤ 2 ama bir alt skor > 1 olan hasta da burada).", renk: "amber" },
  { aralik: "6–10", etiket: "Orta aktif", alt: "Orta aktif hastalık.", renk: "orange" },
  { aralik: "11–12", etiket: "Ağır aktif", alt: "Ağır aktif hastalık — Truelove-Witts ölçütleriyle akut ağır kolit açısından değerlendirin.", renk: "rose" },
];

export default function MayoUcPage() {
  const [diski, setDiski] = React.useState<number | null>(null);
  const [kanama, setKanama] = React.useState<number | null>(null);
  const [endo, setEndo] = React.useState<number | null>(null);
  const [glob, setGlob] = React.useState<number | null>(null);

  const eksik = [diski, kanama, endo, glob].filter((x) => x === null).length;
  const parsiyel = endo === YAPILMADI;
  let skor: number | null = null;
  let bant: Bant | null = null;
  if (eksik === 0) {
    const alt = [DISKI[diski!].pts, KANAMA[kanama!].pts, GLOBAL[glob!].pts];
    if (parsiyel) {
      skor = alt[0] + alt[1] + alt[2];
      bant = skor <= 1 ? PARSIYEL[0] : skor <= 4 ? PARSIYEL[1] : skor <= 6 ? PARSIYEL[2] : PARSIYEL[3];
    } else {
      const e = ENDOSKOPI[endo!].pts;
      skor = alt[0] + alt[1] + alt[2] + e;
      const altMax = Math.max(...alt, e);
      bant = skor <= 2 && altMax <= 1 ? TAM[0] : skor <= 5 ? TAM[1] : skor <= 10 ? TAM[2] : TAM[3];
    }
  }

  return (
    <OlcekKabugu
      slug="mayo-uc"
      ikon="🩺"
      baslik="Ülseratif Kolit Mayo Skoru"
      altBaslik="Ülseratif Kolit Aktivitesi · Tam (0–12) ya da Parsiyel (0–9)"
      paylasim={{ mayo: skor, parsiyel: parsiyel ? 1 : 0 }}
      not={
        <p>
          Dışkı sayısı hastanın remisyondaki olağan sayısına göre değerlendirilir. Günlük kanama skoru en ağır günün değeridir. Güncel çalışmalarda kullanılan modifiye Mayo'da herhangi bir frajilite endoskopik alt skoru 2 yapar; bu araç özgün tanımları kullanır. Schroeder KW ve ark., Gastroenterology 1989.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="diski" baslik="Dışkı sıklığı" secenekler={DISKI} secili={diski} onSec={setDiski} />
        <SecimMaddesi id="kanama" baslik="Rektal kanama" secenekler={KANAMA} secili={kanama} onSec={setKanama} />
        <SecimMaddesi id="endoskopi" baslik="Endoskopik bulgu" secenekler={ENDOSKOPI} secili={endo} onSec={setEndo} />
        <SecimMaddesi id="global" baslik="Hekimin genel değerlendirmesi" secenekler={GLOBAL} secili={glob} onSec={setGlob} />
      </div>
      <SkorPaneli
        skor={skor}
        payda={parsiyel ? 9 : 12}
        bantlar={parsiyel ? PARSIYEL : TAM}
        aktif={bant}
        eksikMetni={`${eksik} alt skor yanıtlanmadı`}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">{parsiyel ? "Parsiyel Mayo — endoskopi olmadan" : "Tam Mayo — endoskopi dahil"}</p> : null}
      />
    </OlcekKabugu>
  );
}
