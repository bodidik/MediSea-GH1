"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Harvey-Bradshaw İndeksi — Crohn hastalığı aktivitesi (Harvey & Bradshaw, Lancet 1980).
 * Önceki günün değerleri. Sıvı dışkı sayısı SAYI olarak girilir (puan = sayı), komplikasyonlar
 * her biri 1 puan.
 */
const GENEL: Secenek[] = [
  { label: "Çok iyi", pts: 0 }, { label: "Biraz kötü", pts: 1 }, { label: "Kötü", pts: 2 }, { label: "Çok kötü", pts: 3 }, { label: "Berbat", pts: 4 },
];
const KARIN: Secenek[] = [
  { label: "Yok", pts: 0 }, { label: "Hafif", pts: 1 }, { label: "Orta", pts: 2 }, { label: "Şiddetli", pts: 3 },
];
const KITLE: Secenek[] = [
  { label: "Yok", pts: 0 }, { label: "Şüpheli", pts: 1 }, { label: "Kesin", pts: 2 }, { label: "Kesin ve hassas", pts: 3 },
];
const KOMPLIKASYONLAR = [
  "Artralji", "Üveit", "Eritema nodozum", "Aftöz ülser", "Piyoderma gangrenozum", "Anal fissür", "Yeni fistül", "Apse",
] as const;
const DISKI_UST = 50;

const BANTLAR: Bant[] = [
  { aralik: "< 5", etiket: "Remisyon", alt: "Klinik remisyon.", renk: "emerald" },
  { aralik: "5–7", etiket: "Hafif aktif", alt: "Hafif aktif hastalık.", renk: "amber" },
  { aralik: "8–16", etiket: "Orta aktif", alt: "Orta aktif hastalık.", renk: "orange" },
  { aralik: "> 16", etiket: "Ağır aktif", alt: "Ağır aktif hastalık.", renk: "rose" },
];

export default function HarveyBradshawPage() {
  const [genel, setGenel] = React.useState<number | null>(null);
  const [karin, setKarin] = React.useState<number | null>(null);
  const [kitle, setKitle] = React.useState<number | null>(null);
  const [diski, setDiski] = React.useState("");
  const [komp, setKomp] = React.useState<ReadonlySet<string>>(new Set());

  const diskiN = parseLocaleNumber(diski);
  // Meşru sıfır: sıvı dışkı olmayabilir.
  const diskiOk = sayiGirildiMi(diski) && Number.isInteger(diskiN) && diskiN >= 0 && diskiN <= DISKI_UST;
  const eksik = [
    genel === null && "genel durum",
    karin === null && "karın ağrısı",
    !diskiOk && `sıvı dışkı sayısı (0–${DISKI_UST}, tam sayı)`,
    kitle === null && "karında kitle",
  ].filter(Boolean) as string[];

  const skor = eksik.length === 0 ? GENEL[genel!].pts + KARIN[karin!].pts + diskiN + KITLE[kitle!].pts + komp.size : null;
  const bant = skor === null ? null : skor < 5 ? BANTLAR[0] : skor <= 7 ? BANTLAR[1] : skor <= 16 ? BANTLAR[2] : BANTLAR[3];

  const degistir = (k: string) =>
    setKomp((s) => {
      const y = new Set(s);
      if (y.has(k)) y.delete(k);
      else y.add(k);
      return y;
    });

  return (
    <OlcekKabugu
      slug="harvey-bradshaw"
      ikon="🩺"
      baslik="Harvey-Bradshaw İndeksi"
      altBaslik="Crohn Hastalığı Aktivitesi · Önceki Günün Değerleri"
      paylasim={{ hbi: skor }}
      not={
        <p>
          CDAI'nin 7 günlük günlük tutma gerektirmeyen sadeleştirilmiş biçimidir ve CDAI ile yüksek korelasyon gösterir. Belirti temelli olduğundan
          irritabl bağırsak belirtileri ya da kısa bağırsak skoru yükseltebilir; endoskopik ve biyokimyasal (CRP, fekal kalprotektin) değerlendirme ile
          birlikte yorumlanır. Klinik yanıt: ≥ 3 puan azalma. Harvey RF, Bradshaw JM, Lancet 1980.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="genel" baslik="Genel iyilik hali" secenekler={GENEL} secili={genel} onSec={setGenel} />
        <SecimMaddesi id="karin" baslik="Karın ağrısı" secenekler={KARIN} secili={karin} onSec={setKarin} />
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-black text-blue-900">Günlük sıvı ya da yumuşak dışkı sayısı</span>
            <span className="text-[11px] text-slate-600">Her dışkı 1 puan.</span>
            <input
              type="text"
              inputMode="numeric"
              value={diski}
              onChange={(e) => setDiski(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg sm:max-w-[10rem]"
            />
          </label>
        </div>
        <SecimMaddesi id="kitle" baslik="Karında kitle" secenekler={KITLE} secili={kitle} onSec={setKitle} />
        <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <legend className="px-2 text-[12px] font-black text-blue-900">Komplikasyonlar — her biri 1 puan</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {KOMPLIKASYONLAR.map((k) => (
              <label
                key={k}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                  ${komp.has(k) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
              >
                <input type="checkbox" checked={komp.has(k)} onChange={() => degistir(k)} className="w-4 h-4 accent-blue-900 shrink-0" />
                <span className="text-[12px] font-bold text-blue-950">{k}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={bant} eksikMetni={`Eksik: ${eksik.join(" · ")}`} />
    </OlcekKabugu>
  );
}
