"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ACR/EULAR 2010 romatoid artrit sınıflama kriterleri (Aletaha ve ark., Arthritis Rheum 2010). 0–10, ≥ 6 kesin RA.
 *
 * Hedef popülasyon ön koşulu: ≥ 1 eklemde klinik sinovit ve başka bir hastalıkla daha iyi açıklanamaması.
 * Ön koşul "hayır" ise puan hesaplanmıyor. Tipik eroziv RA ya da uzun süreli, önceden kriteri karşılamış
 * hastada kriterler uygulanmadan RA kabul edilir — notta yazılı.
 */
const EKLEM: Secenek[] = [
  { label: "1 büyük eklem", pts: 0 },
  { label: "2–10 büyük eklem", pts: 1 },
  { label: "1–3 küçük eklem (büyük eklem tutulumu olsun olmasın)", pts: 2 },
  { label: "4–10 küçük eklem (büyük eklem tutulumu olsun olmasın)", pts: 3 },
  { label: "> 10 eklem (en az 1 küçük eklem)", pts: 5 },
];
const SEROLOJI: Secenek[] = [
  { label: "RF ve ACPA negatif", pts: 0 },
  { label: "RF ya da ACPA düşük pozitif (≤ 3 × üst sınır)", pts: 2 },
  { label: "RF ya da ACPA yüksek pozitif (> 3 × üst sınır)", pts: 3 },
];
const AKUT: Secenek[] = [
  { label: "CRP ve ESR normal", pts: 0 },
  { label: "CRP ya da ESR anormal", pts: 1 },
];
const SURE: Secenek[] = [
  { label: "< 6 hafta", pts: 0 },
  { label: "≥ 6 hafta", pts: 1 },
];
const ONKOSUL: Secenek[] = [
  { label: "Evet", pts: 0 },
  { label: "Hayır", pts: 0 },
];

const BANTLAR: Bant[] = [
  { aralik: "< 6", etiket: "Kriter karşılanmıyor", alt: "Kesin RA sınıflaması için yetersiz — hasta zamanla yeniden değerlendirilebilir; tanı klinik karardır.", renk: "slate" },
  { aralik: "≥ 6", etiket: "Kesin RA", alt: "ACR/EULAR 2010 sınıflama kriterleri karşılanıyor.", renk: "rose" },
];

export default function Ra2010Page() {
  const [onkosul, setOnkosul] = React.useState<number | null>(null);
  const [eklem, setEklem] = React.useState<number | null>(null);
  const [sero, setSero] = React.useState<number | null>(null);
  const [akut, setAkut] = React.useState<number | null>(null);
  const [sure, setSure] = React.useState<number | null>(null);

  const alanlar = [eklem, sero, akut, sure];
  const eksik = alanlar.filter((x) => x === null).length;
  const uygun = onkosul === 0;
  const skor = uygun && eksik === 0 ? EKLEM[eklem!].pts + SEROLOJI[sero!].pts + AKUT[akut!].pts + SURE[sure!].pts : null;
  const bant = skor === null ? null : skor >= 6 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="ra-2010"
      ikon="🖐️"
      baslik="ACR/EULAR 2010 RA Kriterleri"
      altBaslik="Romatoid Artrit Sınıflaması · 0–10 · ≥ 6 Kesin RA"
      paylasim={{ ra2010: skor }}
      not={
        <p>
          Sınıflama kriterleri klinik çalışmalara homojen hasta almak içindir, tanı kriteri değildir; erken hastalıkta skoru &lt; 6 olan hasta RA olabilir.
          Büyük eklemler: omuz, dirsek, kalça, diz, ayak bileği. Küçük eklemler: MKF, PIF, 2.–5. MTF, başparmak IF, el bileği; DIF, 1. KMK ve 1. MTF
          eklemleri sayılmaz. RA'ya tipik erozyonları olan hasta kriterler uygulanmadan RA kabul edilir. Aletaha D ve ark., Arthritis Rheum 2010.
        </p>
      }
    >
      <SecimMaddesi
        id="onkosul"
        baslik="Ön koşul — ≥ 1 eklemde kesin klinik sinovit (şişlik) var ve başka bir hastalıkla daha iyi açıklanamıyor"
        secenekler={ONKOSUL}
        secili={onkosul}
        onSec={setOnkosul}
        rozetGizle
      />
      {onkosul === 1 && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          Ön koşul karşılanmıyor — kriterler bu hastaya uygulanmaz; puan hesaplanmadı.
        </div>
      )}
      <div className="space-y-3">
        <SecimMaddesi id="eklem" baslik="A — Eklem tutulumu" aciklama="Şiş ya da hassas eklem; görüntülemede sinovit de sayılabilir." secenekler={EKLEM} secili={eklem} onSec={setEklem} />
        <SecimMaddesi id="seroloji" baslik="B — Seroloji (en az bir test gerekli)" secenekler={SEROLOJI} secili={sero} onSec={setSero} />
        <SecimMaddesi id="akut" baslik="C — Akut faz reaktanları (en az bir test gerekli)" secenekler={AKUT} secili={akut} onSec={setAkut} />
        <SecimMaddesi id="sure" baslik="D — Semptom süresi" aciklama="Hastanın bildirdiği, değerlendirme anında sinovit belirtilerinin süresi." secenekler={SURE} secili={sure} onSec={setSure} />
      </div>
      <SkorPaneli
        skor={skor}
        payda={10}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={onkosul === null ? "Önce ön koşulu yanıtlayın" : onkosul === 1 ? "Ön koşul karşılanmıyor" : `${eksik} alan yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
