"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * HEP skoru — HIT Expert Probability (Cuker ve ark., J Thromb Haemost 2010).
 * 8 klinik özellik, ağırlıklı; tavan 19. 4T'den farkı: eksi puanlar alternatif açıklamaları CEZALANDIRIR.
 *
 *   Düşüş büyüklüğü       < %30 −1 · %30–50 +1 · > %50 +3
 *   Zamanlama (tipik)      heparinden < 4 gün −2 · 4. gün +2 · 5–10. gün +3 · 11–14. gün +2 · > 14 gün −1
 *   Zamanlama (hızlı)      son 100 günde heparin: yeniden maruziyetten < 48 sa +2 · > 48 sa −1
 *   Nadir                  ≤ 20 × 10⁹/L −2 · > 20 +2
 *   Tromboz                yeni VTE/ATE (≥ 4. gün) +3 · heparin altında mevcut trombozun ilerlemesi +2
 *   Enjeksiyon yerinde deri nekrozu +3 · IV bolus sonrası akut sistemik reaksiyon +2
 *   Kanama / peteşi / yaygın ekimoz −1
 *   Başka neden: yok +3; varsa her biri kendi eksi puanıyla toplanır
 *
 * Zamanlama iki ayrı durumda tutuluyor ve yalnız SORULAN dal hesaba giriyor (gizli sorudaki eski yanıt sızmasın).
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const DUSUS: Secenek[] = [{ label: "< %30", pts: -1 }, { label: "%30–50", pts: 1 }, { label: "> %50", pts: 3 }];
const MARUZIYET: Secenek[] = [
  { label: "Hayır — tipik başlangıç", pts: 0 },
  { label: "Evet — hızlı başlangıç olasılığı", pts: 0 },
];
const TIPIK: Secenek[] = [
  { label: "Heparin başladıktan sonraki < 4 gün içinde", pts: -2 },
  { label: "4. gün", pts: 2 },
  { label: "5–10. gün", pts: 3 },
  { label: "11–14. gün", pts: 2 },
  { label: "> 14. gün", pts: -1 },
];
const HIZLI: Secenek[] = [
  { label: "Yeniden maruziyetten sonraki < 48 saat", pts: 2 },
  { label: "Yeniden maruziyetten sonraki > 48 saat", pts: -1 },
];
const NADIR: Secenek[] = [{ label: "≤ 20 × 10⁹/L", pts: -2 }, { label: "> 20 × 10⁹/L", pts: 2 }];
const TROMBOZ: Secenek[] = [
  { label: "Yok", pts: 0 },
  { label: "Heparinden ≥ 4 gün sonra yeni venöz ya da arteriyel tromboz", pts: 3 },
  { label: "Heparin altında önceden var olan trombozun ilerlemesi", pts: 2 },
];
const BASKA_NEDEN: Secenek[] = [{ label: "Yok — başka belirgin neden yok", pts: 3 }, { label: "Var", pts: 0 }];

const NEDENLER: ReadonlyArray<{ id: string; metin: string; puan: number }> = [
  { id: "kronik", metin: "Kronik trombositopenik hastalık", puan: -1 },
  { id: "ilac", metin: "Trombositopeni yaptığı bilinen, yeni başlanmış heparin dışı ilaç", puan: -2 },
  { id: "enfeksiyon", metin: "Ağır enfeksiyon", puan: -2 },
  { id: "dic", metin: "Ağır DİK (fibrinojen < 100 mg/dL ve D-dimer > 5 µg/mL)", puan: -2 },
  { id: "cihaz", metin: "Arter içi cihaz (IABP, VAD, ECMO)", puan: -2 },
  { id: "bypass", metin: "Son 96 saatte kardiyopulmoner bypass", puan: -1 },
];

const BANTLAR: Bant[] = [
  { aralik: "< 2", etiket: "HIT olasılığı düşük", alt: "Türetme çalışmasında < 2 skorlu hastaların hiçbirinde HIT yoktu — başka nedenler araştırılmalı.", renk: "emerald" },
  { aralik: "2–4", etiket: "HIT dışlanamaz", alt: "Anti-PF4 immünoassay gönderilmeli; kanama riski izin veriyorsa heparin kesilip heparin dışı antikoagülana geçilmesi düşünülür.", renk: "amber" },
  { aralik: "≥ 5", etiket: "HIT olasılığı yüksek", alt: "Heparin derhal kesilir, heparin dışı antikoagülan başlanır; anti-PF4 ve fonksiyonel test (SRA/HIPA) ile doğrulanır.", renk: "rose" },
];

const kutu = "bg-white rounded-2xl border border-slate-200 p-4 shadow-sm";

export default function HepSkoruPage() {
  const [dusus, setDusus] = React.useState<number | null>(null);
  const [maruziyet, setMaruziyet] = React.useState<number | null>(null);
  const [tipik, setTipik] = React.useState<number | null>(null);
  const [hizli, setHizli] = React.useState<number | null>(null);
  const [nadir, setNadir] = React.useState<number | null>(null);
  const [tromboz, setTromboz] = React.useState<number | null>(null);
  const [nekroz, setNekroz] = React.useState<number | null>(null);
  const [reaksiyon, setReaksiyon] = React.useState<number | null>(null);
  const [kanama, setKanama] = React.useState<number | null>(null);
  const [baska, setBaska] = React.useState<number | null>(null);
  const [nedenler, setNedenler] = React.useState<ReadonlySet<string>>(new Set());

  const zamanlama = maruziyet === 0 ? (tipik !== null ? TIPIK[tipik].pts : null) : maruziyet === 1 ? (hizli !== null ? HIZLI[hizli].pts : null) : null;
  const nedenPuani = baska === 0 ? 3 : baska === 1 && nedenler.size > 0 ? NEDENLER.filter((x) => nedenler.has(x.id)).reduce((t, x) => t + x.puan, 0) : null;

  const eksik = [
    dusus === null && "düşüş büyüklüğü",
    zamanlama === null && "zamanlama",
    nadir === null && "nadir",
    tromboz === null && "tromboz",
    nekroz === null && "deri nekrozu",
    reaksiyon === null && "sistemik reaksiyon",
    kanama === null && "kanama",
    nedenPuani === null && (baska === 1 ? "başka nedenlerden en az birini işaretleyin" : "başka neden"),
  ].filter(Boolean) as string[];

  const skor = eksik.length === 0
    ? DUSUS[dusus!].pts + zamanlama! + NADIR[nadir!].pts + TROMBOZ[tromboz!].pts + (nekroz === 1 ? 3 : 0) + (reaksiyon === 1 ? 2 : 0) + (kanama === 1 ? -1 : 0) + nedenPuani!
    : null;
  const bant = skor === null ? null : skor < 2 ? BANTLAR[0] : skor <= 4 ? BANTLAR[1] : BANTLAR[2];

  const degistir = (id: string) => setNedenler((s) => { const y = new Set(s); if (y.has(id)) y.delete(id); else y.add(id); return y; });

  return (
    <OlcekKabugu
      slug="hep-skoru"
      ikon="🩸"
      baslik="HEP Skoru — HIT"
      altBaslik="HIT Uzman Olasılık Skoru · 8 Klinik Özellik · Tavan 19"
      paylasim={{ hep: skor }}
      not={
        <p>
          Uzman görüşünden türetilmiş ve ilk kohortta 4T'ye göre gözlemciler arası uyumu ve ayırt ediciliği daha iyi bulunmuştur; eşik 2'de duyarlılık
          %100, eşik 5'te özgüllük daha yüksektir. Skor laboratuvar testinin yerine geçmez, test isteme ve heparini kesme kararını yönlendirir. HIT
          düşünülen hastada trombosit transfüzyonu ve varfarin başlanması ertelenir. Cuker A ve ark., J Thromb Haemost 2010.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="dusus" baslik="Trombosit düşüşünün büyüklüğü (en yüksek değere göre)" secenekler={DUSUS} secili={dusus} onSec={setDusus} />
        <SecimMaddesi id="maruziyet" baslik="Son 100 günde heparin maruziyeti var mı?" aciklama="Varsa dolaşımdaki antikorlarla hızlı başlangıçlı HIT olabilir." secenekler={MARUZIYET} secili={maruziyet} onSec={setMaruziyet} rozetGizle />
        {maruziyet === 0 && <SecimMaddesi id="tipik" baslik="Düşüşün başladığı zaman" secenekler={TIPIK} secili={tipik} onSec={setTipik} />}
        {maruziyet === 1 && <SecimMaddesi id="hizli" baslik="Düşüşün başladığı zaman" secenekler={HIZLI} secili={hizli} onSec={setHizli} />}
        <SecimMaddesi id="nadir" baslik="Trombosit nadiri" secenekler={NADIR} secili={nadir} onSec={setNadir} />
        <SecimMaddesi id="tromboz" baslik="Tromboz (yalnız birini seçin)" secenekler={TROMBOZ} secili={tromboz} onSec={setTromboz} />
        <SecimMaddesi id="nekroz" baslik="Heparin enjeksiyon yerinde deri nekrozu" secenekler={eh(3)} secili={nekroz} onSec={setNekroz} />
        <SecimMaddesi id="reaksiyon" baslik="İntravenöz heparin bolusundan sonra akut sistemik reaksiyon" aciklama="Ateş, titreme, taşikardi, dispne, göğüs ağrısı ya da hipotansiyon." secenekler={eh(2)} secili={reaksiyon} onSec={setReaksiyon} />
        <SecimMaddesi id="kanama" baslik="Kanama, peteşi ya da yaygın ekimoz" secenekler={eh(-1)} secili={kanama} onSec={setKanama} />
        <SecimMaddesi id="baska" baslik="Trombositopeninin başka belirgin nedeni" secenekler={BASKA_NEDEN} secili={baska} onSec={setBaska} />
        {baska === 1 && (
          <fieldset className={kutu}>
            <legend className="px-2 text-[12px] font-black text-blue-900">Var olan nedenler (her biri ayrı puanlanır)</legend>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {NEDENLER.map((x) => (
                <label key={x.id} className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer ${nedenler.has(x.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                  <input type="checkbox" checked={nedenler.has(x.id)} onChange={() => degistir(x.id)} className="w-4 h-4 accent-blue-900 shrink-0" />
                  <span className="text-[12px] font-bold text-blue-950 leading-snug flex-1 min-w-0">{x.metin}</span>
                  <span className="text-[11px] font-black text-slate-700 shrink-0">{x.puan}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
      <SkorPaneli skor={skor} payda={19} bantlar={BANTLAR} aktif={bant} eksikMetni={`Eksik: ${eksik.join(" · ")}`} />
    </OlcekKabugu>
  );
}
